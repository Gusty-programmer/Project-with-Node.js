window.addEventListener("load",function(){
// 	var myHeaders = new Headers();
// myHeaders.append();
	var prod_sel=localStorage.getItem("produse_selectate")


	if (prod_sel){ //p.then(f1).then(f2).then(f3)
		var vect_ids=prod_sel.split(",");
		fetch("/produse_cos", {		

			method: "POST",
			headers:{'Content-Type': 'application/json'},
			
			mode: 'cors',		
			cache: 'default',
			body: JSON.stringify({
				ids_prod: vect_ids,
				a:10
			})
		})
		.then(function(rasp){ 
			
			 x=rasp.json(); 
			  return x;
			})
		.then(function(objson) {
	
			
			for (let prod of objson){
				let divCos=document.createElement("div");
				divCos.classList.add("cos-virtual")
				divCos.id = prod.id;
				let divImagine=document.createElement("div");
				let imag=document.createElement("img");
				imag.src="/resurse/imagini/produse/" + prod.imagine;
				divImagine.appendChild(imag);
				divCos.appendChild(divImagine);
				let divInfo=document.createElement("div");
				divInfo.innerHTML=`<p><b>${prod.nume}</b></p><p>Pret: ${prod.pret}</p>`;
				divCos.appendChild(divInfo);
				let btnDel=document.createElement("button");
				divCos.appendChild(btnDel);
				btnDel.innerHTML=prod.id;
				btnDel.classList.add("delete");
				document.getElementsByTagName("main")[0].insertBefore(divCos, document.getElementById("cumpara"));
				
				
				 
			}
			var cosProd = document.getElementsByClassName("cos-virtual");
			var btn_del = document.getElementsByClassName("delete");
			for (let bd of btn_del) {
				bd.onclick = function () {
					var id = bd.innerHTML;
					// console.log("clicked", id);
					var cos_produse=localStorage.getItem("produse_selectate")
                    var cos_id = document.getElementById(id)
                   cos_produse=cos_produse.split(",");                                
                   console.log("Selectie cos veche:", cos_produse);
             
				   cos_produse.splice(cos_produse.indexOf(id), 1)
			 
			      console.log("Selectie cos noua:",cos_produse);
					localStorage.setItem("produse_selectate", cos_produse.join(","))
					cos_id.remove();
					if (cosProd.length == 0) {
						document.getElementById("cumpara").remove();
					}
					console.log(cosProd.length);
                   }
			}
				
		}
		).catch(function(err){console.log(err)});



		document.getElementById("cumpara").onclick=function(){
			
			var vect_ids = localStorage.getItem("produse_selectate").split(",");
			
			fetch("/cumpara", {		
	
				method: "POST",
				headers:{'Content-Type': 'application/json'},
				
				mode: 'cors',		
				cache: 'default',
				body: JSON.stringify({
					ids_prod: vect_ids,
					a:10
				})
			})
			.then(function(rasp){ return rasp.text()})
			.then(function(raspunsText) {
		   
				console.log(raspunsText);
	
				let p=document.createElement("p");
				p.innerHTML=raspunsText;
				document.getElementsByTagName("main")[0].innerHTML="";
				document.getElementsByTagName("main")[0].appendChild(p)
				if(raspunsText.includes("Factura")){
					localStorage.removeItem("produse_selectate");
				}
		   
			}
			).catch(function (err) { console.log(err) });
			
		}
	}
	else{
		document.getElementsByTagName("main")[0].innerHTML="<p>Nu aveti nimic in cos!</p>";
	}
	
	
});