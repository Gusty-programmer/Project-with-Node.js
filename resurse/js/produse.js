window.addEventListener("DOMContentLoaded", function () {

    const articole = document.getElementsByClassName("produs");
    var btn = document.getElementById("filtrare").onclick = function () {
    
        // var articole = document.getElementsByClassName("produs");
        for (let art of articole) {

            art.style.display = "none";
            var nume = art.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            
            var conditie1 = nume.startsWith(document.getElementById("inp-nume").value.toLowerCase())

            var pret = art.getElementsByClassName("val-pret")[0]
            var conditie2 = parseInt(pret.innerHTML) > parseInt(document.getElementById("inp-pret").value);

            var radbtns = document.getElementsByName("gr_rad");
            for (let rad of radbtns){
                if (rad.checked){
                    var valNivel=rad.value;//poate fi 1, 2 sau 3
                    break;
                }
            }
            
            var nivelDif = parseInt(art.getElementsByClassName("val-nivel")[0].title);
            var conditie3=false;
            switch (valNivel){
                case "1": conditie3= (nivelDif <= 150); break;
                case "2": conditie3= (nivelDif > 150 && nivelDif <= 250); break;
                case "3": conditie3= (nivelDif > 250); break;
                default: conditie3=true;

            }
            var selCateg=document.getElementById("inp-categorie");
            var conditie4= (art.getElementsByClassName("val-categorie")[0].innerHTML == selCateg.value ||  selCateg.value=="toate");
            // var materiale = document.getElementById("inp_sel_mlt");
            var materiale = art.getElementsByClassName("mat")[0].title; 
            var optiuni = document.getElementById("inp_sel_mlt").options;
            matArray = materiale.split(",");
            
            var conditie5 = true;
		for(let opt of optiuni){
            if (opt.selected){
                conditie5 = matArray.includes(opt.value); 
            }
		}
            if (conditie1 && conditie2 && conditie3 && conditie4 && conditie5)
                art.style.display="block";  
        }
    }
    var range=document.getElementById("inp-pret");
    range.onmousemove=function(){
        var info = document.getElementById("infoRange");//returneaza null daca nu gaseste elementul
        if(!info){
            info=document.createElement("span");
            info.id="infoRange"
            this.parentNode.appendChild(info);
        }
        
        info.innerHTML = "(" + this.value + ")";   
    }
    function sortprice() {
        // var articole=document.getElementsByClassName("produs");
        var v_articole = Array.from(articole);
        pret_sortat = v_articole.sort(function (a, b) {
            var pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);

            return (pret_a - pret_b);
        });
        document.getElementById("min").innerHTML = document.getElementById("inp-pret").min =
            parseInt(pret_sortat[0].getElementsByClassName("val-pret")[0].innerHTML);
        document.getElementById("max").innerHTML = document.getElementById("inp-pret").max =
            parseInt(pret_sortat[pret_sortat.length - 1].getElementsByClassName("val-pret")[0].innerHTML);  
    }
    sortprice();
    function sorteaza(semn){
        // var articole=document.getElementsByClassName("produs");
        var v_articole=Array.from(articole);
        v_articole.sort(function (a, b) {
            var pret_a=parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
                var pret_b=parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
            
            if (pret_a != pret_b) {
                return semn * (pret_a - pret_b);     
            }
            else{  
                var mat_a=parseInt(a.getElementsByClassName("val-mat")[0].innerHTML);
                var mat_b=parseInt(b.getElementsByClassName("val-mat")[0].innerHTML);
                return semn* (mat_a - mat_b);
            }
        });
        for(let art of v_articole){
            art.parentNode.appendChild(art);
        }
    }

    var sortCresc=document.getElementById("sortCrescNume");
    sortCresc.onclick=function(){
        
        sorteaza(1);
    }

    var sortDescresc=document.getElementById("sortDescrescNume");
    sortDescresc.onclick=function(){
        sorteaza(-1)
    }
    document.getElementById("resetare").onclick=function(){
        //resetare inputuri
        document.getElementById("i_rad4").checked=true;
        document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
        document.getElementById("infoRange").innerHTML="("+document.getElementById("inp-pret").min+")";
        document.getElementById("inp-nume").value = "";
        // document.getElementById("inp-categorie").value = "toate";
        document.getElementById("sel-toate").selected = true;
        var optiuni = document.getElementById("inp_sel_mlt").options;
        for(let opt of optiuni)
        opt.selected = false;
        //de completat...


        //resetare articole
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){

            art.style.display="block";
        }
    }
     // -------------------- selectare produse cos virtual----------------------------------
    /*
        indicatie pentru cand avem cantitati
        fara cantitati: "1,2,3,4" //1,2,3,4 sunt id-uri
        cu cantitati:"1:5,2:3,3:1,4:1" // 5 produse de tipul 1, 3 produse de tipul 2, 1 produs de tipul 3...
        putem memora: [[1,5],[2,3],[3,1],[4,1]]// un element: [id, cantitate]

    */
    
        ids_produse_init=localStorage.getItem("produse_selectate");
        if(ids_produse_init)
            ids_produse_init=ids_produse_init.split(",");//obtin vectorul de id-uri ale produselor selectate  (din cosul virtual)
        else
            ids_produse_init=[]
    var selnr = document.getElementsByClassName("cantitate");
        var checkboxuri_cos = document.getElementsByClassName("select-cos");
         
        for (let ch in checkboxuri_cos){
            if (ids_produse_init.indexOf(checkboxuri_cos[ch].value) != -1) {
                checkboxuri_cos[ch].checked = true;
            selnr[ch].style.display = "flex";
            }
                
            checkboxuri_cos[ch].onchange=function(){
                ids_produse = localStorage.getItem("produse_selectate")
                if (checkboxuri_cos[ch].checked) selnr[ch].style.display = "flex";
                else selnr[ch].style.display = "none";
                if (ids_produse) {
                    ids_produse = ids_produse.split(",");
                    
                }
                    
                else {
                    ids_produse = [];
                    
                }
                    
                console.log("Selectie veche:", ids_produse);
                //ids_produse.map(function(elem){return parseInt(elem)});
                //console.log(ids_produse);
                if (checkboxuri_cos[ch].checked) {
                    
                    ids_produse.push(checkboxuri_cos[ch].value);//adaug elementele noi, selectate (bifate)
                }
                else{
                    ids_produse.splice(ids_produse.indexOf(checkboxuri_cos[ch].value), 1) //sterg elemente debifate
                }
                console.log("Selectie noua:",ids_produse);
                localStorage.setItem("produse_selectate",ids_produse.join(","))
            }
        }

});
window.onkeydown=function(e){
    console.log(e);
    if(e.key=="c" && e.altKey==true){
        var suma=0;
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){
            if(art.style.display!="none")
                suma+=parseFloat(art.getElementsByClassName("val-pret")[0].innerHTML);
        }

        var spanSuma;
        spanSuma=document.getElementById("numar-suma");
        if(!spanSuma){
            spanSuma=document.createElement("span");
            spanSuma.innerHTML=" Suma:"+suma;//<span> Suma:...
            spanSuma.id="numar-suma";//<span id="..."
            document.getElementById("p-suma").appendChild(spanSuma);
            setTimeout(function(){document.getElementById("numar-suma").remove()}, 1500);
        }
    }


} 
  // for (let ch of checkboxuri_cos){
        //     if (ids_produse_init.indexOf(ch.value) != -1) {
        //         ch.checked = true;
        //     selnr[ch.indexOf].style.display = "flex";
        //     }
                
        //     ch.onchange=function(){
        //         ids_produse = localStorage.getItem("produse_selectate")
        //         if (ch.checked) selnr[0].style.display = "flex";
        //         else selnr[0].style.display = "none";
        //         if (ids_produse) {
        //             ids_produse = ids_produse.split(",");
                    
        //         }
                    
        //         else {
        //             ids_produse = [];
                    
        //         }
                    
        //         console.log("Selectie veche:", ids_produse);
        //         //ids_produse.map(function(elem){return parseInt(elem)});
        //         //console.log(ids_produse);
        //         if (ch.checked) {
                    
        //             ids_produse.push(ch.value);//adaug elementele noi, selectate (bifate)
        //         }
        //         else{
        //             ids_produse.splice(ids_produse.indexOf(ch.value), 1) //sterg elemente debifate
        //         }
        //         console.log("Selectie noua:",ids_produse);
        //         localStorage.setItem("produse_selectate",ids_produse.join(","))
        //     }
        // }