
const express = require("express");
const fs= require('fs');
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');

const Client = require('pg').Client;

//conexiunea la baza de date
var client= new Client({database:"cti_2024",
        user:"alin",
        password:"alin",
        host:"localhost",
        port:5432});
client.connect();

//afiseaza tabelul masini
client.query("select * from masini", function(err, rez){
    console.log(rez);
})

obGlobal ={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname,"resurse/scss"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"backup"),
}

vect_foldere=["temp", "temp1", "backup"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
 
app.set("view engine","ejs");
 
app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));



// app.get("/", function(req, res){
//     res.sendFile(__dirname+"/index.html")
// })

app.get(["/","/home","/index"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini});
})


// trimiterea unui mesaj fix
app.get("/cerere", function(req, res){
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");

})

//trimiterea unui mesaj dinamic

app.get("/data", function(req, res, next){
    res.write("Data: ");
    next();
});
app.get("/data", function(req, res){
    res.write(""+new Date());
    res.end();

});


app.get("*/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=path.join(__dirname,"temp/galerie_animata.scss")
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=path.join(__dirname,"temp/galerie_animata.css");
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});

/*
trimiterea unui mesaj dinamic in functie de parametri (req.params; req.query)
ce face /* si ordinea app.get-urilor.
*/
app.get("/suma/:a/:b", function(req, res){
    var suma=parseInt(req.params.a)+parseInt(req.params.b)
    res.send(""+suma);

});

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/ico/favicon.ico"));
    
});



// -------------------------------------- Produse ----------------------------------------

// Endpoint pentru afișarea produselor
app.get("/produse", function(req, res) {
    console.log(req.query); // Afișează parametrii query în consolă

    var conditieQuery = "";
    var params = [];

    // Filtrare după nume
    if (req.query.nume) {
        conditieQuery += ` AND nume ILIKE $${params.length + 1}`; // Adaugă condiția de filtrare după nume
        params.push(`%${req.query.nume}%`); // Adaugă valoarea filtrului la lista de parametri
    }

    // Filtrare după consum combustibil
    if (req.query.consum_combustibil && req.query.consum_combustibil !== 'toate') {
        let [min, max] = req.query.consum_combustibil.split(':'); // Desparte valorile minime și maxime
        if (min && max) {
            conditieQuery += ` AND consum_combustibil BETWEEN $${params.length + 1} AND $${params.length + 2}`;
            params.push(min, max); // Adaugă valorile minime și maxime la lista de parametri
        }
    }

    // Filtrare după preț
    if (req.query.pret) {
        conditieQuery += ` AND pret >= $${params.length + 1}`; // Adaugă condiția de filtrare după preț
        params.push(req.query.pret); // Adaugă valoarea prețului la lista de parametri
    }

    // Filtrare după tipul mașinii
    if (req.query.tip_masina && req.query.tip_masina !== 'toate') {
        conditieQuery += ` AND tip_masina = $${params.length + 1}`; // Adaugă condiția de filtrare după tipul mașinii
        params.push(req.query.tip_masina); // Adaugă valoarea tipului la lista de parametri
    }

    // Sortare doar după preț
    var sortQuery = "";
    if (req.query.sort) {
        if (req.query.sort === "asc") {
            sortQuery = " ORDER BY pret ASC"; // Setează sortarea crescătoare după preț
        } else if (req.query.sort === "desc") {
            sortQuery = " ORDER BY pret DESC"; // Setează sortarea descrescătoare după preț
        }
    }

    // Dacă există condiții de filtrare, adaugă WHERE în fața lor
    if (conditieQuery) {
        conditieQuery = "WHERE " + conditieQuery.slice(4); // Elimină primul AND și adaugă WHERE
    }

    // Interogare pentru a obține tipurile de mașini
    client.query("SELECT unnest(enum_range(NULL::tip_masina)) AS tip_masina", function(err, rezOptiuni) {
        if (err) {
            console.log(err); // Afișează eroarea în consolă
            res.status(500).send('Error retrieving options from database'); // Trimite eroarea clientului
        } else {
            // Interogare pentru a obține mașinile filtrate și sortate
            client.query(`SELECT * FROM masini ${conditieQuery} ${sortQuery}`, params, function(err, rez) {
                if (err) {
                    console.log(err); // Afișează eroarea în consolă
                    afisareEroare(res, 2); // Afișează un mesaj de eroare clientului
                } else {
                    res.render("pagini/produse", { masini: rez.rows, optiuni: rezOptiuni.rows }); // Trimite datele către client pentru a fi afișate
                }
            });
        }
    });
});

// Endpoint pentru pagina unui produs specific
app.get("/produs/:id", function(req, res) {
    client.query("SELECT * FROM masini WHERE id=$1", [req.params.id], function(err, rez) {
        if (err) {
            console.log(err); // Afișează eroarea în consolă
            res.status(500).send('Error retrieving data from database'); // Trimite eroarea clientului
        } else {
            res.render("pagini/produs", { masina: rez.rows[0] }); // Trimite datele către client pentru a fi afișate
        }
    });
});








 
app.get("/*.ejs", function(req, res){
    afisareEroare(res,400);
});
app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function(req, res){
    afisareEroare(res,403);  
});
app.get("/*", function(req, res){
    //console.log(req.url)
    try {
        res.render("pagini"+req.url, function(err, rezHtml){
            // console.log(rezHtml);
            // console.log("Eroare:"+err)

                if (err){
                    if (err.message.startsWith("Failed to lookup view")){
                        afisareEroare(res,404);
                        console.log("Nu a gasit pagina: ", req.url)
                    }
                    
                }

            
        });         
    }
    catch (err1){
        if (err1.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
            console.log("Nu a gasit resursa: ", req.url)
        }
        else{
            afisareEroare(res);
            console.log("Eroare:"+err1)
        }
    }

})  
 
function initErori(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    console.log(continut);
    
    obGlobal.obErori=JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza,eroare.imagine)
    }
    obGlobal.obErori.eroare_default=path.join(obGlobal.obErori.cale_baza,obGlobal.obErori.eroare_default.imagine)
    console.log(obGlobal.obErori);

} 
initErori()


function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare=obGlobal.obErori.info_erori.find(
        function(elem){
            return elem.identificator==_identificator
        }
    )
    if (!eroare){
        let eroare_default=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        }) //al doilea argument este locals
        return;
    }
    else{
        if (eroare.status)
            res.status(eroare.identificator)

        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
        })
        return;

    }

}


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
    }
    console.log(obGlobal.obImagini)
}
initImagini();



function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

 
app.listen(8080);
console.log("Serverul a pornit");