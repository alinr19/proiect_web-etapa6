window.addEventListener("load", function() {
    // Actualizează valoarea afișată a intervalului de prețuri
    document.getElementById("inp-pret").onchange = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    // Funcție pentru filtrarea produselor
    document.getElementById("filtrare").onclick = function() {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim(); // Preia și normalizează numele pentru filtrare

        var radioConsum = document.getElementsByName("gr_rad"); // Preia toate opțiunile de consum combustibil
        let inpConsum;
        for (let rad of radioConsum) {
            if (rad.checked) {
                inpConsum = rad.value; // Găsește opțiunea selectată
                break;
            }
        }
        let minConsum, maxConsum;
        if (inpConsum != "toate") {
            vConsum = inpConsum.split(":"); // Desparte valorile minime și maxime de consum
            minConsum = parseInt(vConsum[0]);
            maxConsum = parseInt(vConsum[1]);
        }

        var inpPret = parseInt(document.getElementById("inp-pret").value); // Preia valoarea intervalului de preț

        var inpTip = document.getElementById("inp-tip").value.toLowerCase().trim(); // Preia și normalizează tipul mașinii pentru filtrare

        var produse = document.getElementsByClassName("produs"); // Preia toate produsele
        for (let produs of produse) {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim(); // Preia și normalizează numele produsului
            let cond1 = valNume.startsWith(inpNume); // Condiție pentru nume

            let valConsum = parseInt(produs.getElementsByClassName("val-consum")[0].innerHTML); // Preia valoarea consumului de combustibil
            let cond2 = (inpConsum == "toate" || (minConsum <= valConsum && valConsum < maxConsum)); // Condiție pentru consum

            let valPret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML); // Preia valoarea prețului
            let cond3 = (valPret >= inpPret); // Condiție pentru preț

            let valTip = produs.getElementsByClassName("val-tip")[0].innerHTML.toLowerCase().trim(); // Preia și normalizează tipul produsului
            let cond4 = (inpTip == valTip || inpTip == "toate"); // Condiție pentru tip

            if (cond1 && cond2 && cond3 && cond4) {
                produs.style.display = "block"; // Afișează produsul dacă toate condițiile sunt îndeplinite
            } else {
                produs.style.display = "none"; // Ascunde produsul dacă oricare condiție nu este îndeplinită
            }
        }
    }

    // Funcție pentru resetarea filtrului
    document.getElementById("resetare").onclick = function() {
        document.getElementById("inp-nume").value = ""; // Resetează câmpul de nume
        document.getElementById("inp-pret").value = document.getElementById("inp-pret").min; // Resetează câmpul de preț
        document.getElementById("inp-tip").value = "toate"; // Resetează câmpul de tip
        document.getElementById("i_rad4").checked = true; // Resetează câmpul de consum
        var produse = document.getElementsByClassName("produs"); // Preia toate produsele
        document.getElementById("infoRange").innerHTML = "(0)"; // Resetează afișarea intervalului de preț
        for (let prod of produse) {
            prod.style.display = "block"; // Afișează toate produsele
        }
    }

    // Funcție pentru sortarea produselor
    function sorteaza(semn) {
        var produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse);
        v_produse.sort(function(a, b) {
            let pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b) {
                let nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
                let nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b); // Sortează alfabetic dacă prețurile sunt egale
            }
            return semn * (pret_a - pret_b); // Sortează după preț
        });
        for (let prod of v_produse) {
            prod.parentNode.appendChild(prod); // Rearanjează produsele în DOM conform ordinii sortate
        }
    }
    
    // Sortare crescătoare după nume
    document.getElementById("sortCrescNume").onclick = function() {
        sorteaza(1);
    }

    // Sortare descrescătoare după nume
    document.getElementById("sortDescrescNume").onclick = function() {
        sorteaza(-1);
    }

    // Afișare sumă totală a prețurilor produselor vizibile când se apasă Alt + C
    window.onkeydown = function(e) {
        if (e.key == "c" && e.altKey) {
            var suma = 0;
            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) {
                var stil = getComputedStyle(produs);
                if (stil.display != "none") {
                    suma += parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML); // Adună prețurile produselor vizibile
                }
            }
            if (!document.getElementById("par_suma")) {
                let p = document.createElement("p");
                p.innerHTML = suma; // Afișează suma
                p.id = "par_suma";
                let container = document.getElementById("produse");
                container.insertBefore(p, container.children[0]);
                setTimeout(function() {
                    var pgf = document.getElementById("par_suma");
                    if (pgf) pgf.remove(); // Elimină afișarea sumei după 2 secunde
                }, 2000);
            }
        }
    }
});
