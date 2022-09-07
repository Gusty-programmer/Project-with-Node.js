const express = require("express");
const path  = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ejs = require("ejs");
const sass = require("sass");
const { Client } = require("pg");
const formidable= require('formidable');
const crypto= require('crypto');
const nodemailer= require('nodemailer');
const session= require('express-session');
const html_to_pdf = require('html-pdf-node');
var QRCode = require('qrcode');
const helmet=require('helmet');
const juice=require('juice');

var obGlobal = {
    obImagini: null,
    obErori: null,
    emailServer:"tehnici.web.gusti@gmail.com",
    protocol:null,
    numeDomeniu:null, 
    port:8080,
    sirAlphaNum:""
}
var app = express();

var client=new Client({user: "*********", password: "*********", database: "*********", host: "localhost", port: 5432});
protocol = "http://";
  numeDomeniu="localhost:8080";

client.connect();

app.set("view engine", "ejs");

app.use(helmet.frameguard());

app.get("/*galerie_animata.css", function (req, res) {  
    
    for (let i = 5; i <= 11; i++){
        if (i % 2 !== 0) {
            var t1 = 50 / i;
            var t2 = t1 * 2;
            var t3 = 100 - t2;
            var t = [t1, t2, t3];
            var continutScss = fs.readFileSync(__dirname + "/resurse/css/galerie_animata.scss").toString("utf8"); 
            rezScss = ejs.render(continutScss, { nrImagini: i, procent: t });
            var caleScss = __dirname + "/temp/galerie_animata.scss";
            fs.writeFileSync(caleScss, rezScss); 
            rezCompilare = sass.compile(caleScss, { sourceMap: true });  
            var caleCss = __dirname + "/temp/galerie_animata_"+i+".css";
            fs.writeFileSync(caleCss, rezCompilare.css);        
        }    
    }
    var i = Math.floor(Math.random() * 7 + 5); 
    if (i % 2 == 0) {
        i += 1;
    }
    try {
    var caleCssRand = __dirname + "/temp/galerie_animata_" + i + ".css";
    var caleCss = __dirname + "/temp/galerie_animata.css";
    console.log(i);
    fs.copyFileSync(caleCssRand, caleCss);
    res.setHeader("Content-Type", "text/css");
    res.sendFile(caleCss);
    }
                catch (err) {
                    res.send("Eroare");
                } 
    
});

app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));

app.use(["/contact"], express.urlencoded({extended:true}));

app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false
}));

app.use("/resurse", express.static(__dirname + "/resurse"));
  
app.use(function (req, res, next) {
    res.locals.utilizator = req.session.utilizator;
    res.locals.mesajLogin=req.session.mesajLogin;
    req.session.mesajLogin = null;
    next();
});

app.get("/api", (req, res) => {
    res.json({ message: "Something" });
});

app.get("/eroare", function(req, res){
    randeazaEroare(res,1, "Titlu schimbat");

});

cale_qr="./resurse/imagini/qrcode"; 
if (fs.existsSync(cale_qr))
  fs.rmSync(cale_qr, {force:true, recursive:true});
fs.mkdirSync(cale_qr);
client.query("select id from machete", function(err, rez){
    for(let prod of rez.rows){
        let cale_prod=protocol+numeDomeniu+"/produs/"+prod.id;
        QRCode.toFile(cale_qr+"/"+prod.id+".png",cale_prod);
    }
});

function getIp(req){
    var ip = req.ip;
    if (ip){
        let vect=ip.split(",");
        return vect[vect.length-1];
    } 
    else if (req.ip){
        return req.ip;
    }
    else{
     return req.connection.remoteAddress;
    }
}

var ipuri_active = {};

app.use("/*",function(req,res,next){
    let ipReq=getIp(req);
    let ip_gasit=ipuri_active[ipReq+"|"+req.url];
    timp_curent=new Date();
    if(ip_gasit){
        if( (timp_curent-ip_gasit.data)< 5*1000) {
            if (ip_gasit.nr>10){
                res.send("<h1>Prea multe cereri intr-un interval scurt. Ia te rog sa fii cuminte, da?!</h1>");
                ip_gasit.data=timp_curent
                return;
            }
            else{   
                ip_gasit.data=timp_curent;
                ip_gasit.nr++;
            }
        }
        else{
            ip_gasit.data=timp_curent;
            ip_gasit.nr=1;                  
        }
    }
    else{
        ipuri_active[ipReq+"|"+req.url]={nr:1, data:timp_curent};
    }
    let comanda_param= `insert into accesari(ip, user_id, pagina) values ($1::text, $2,  $3::text)`;
    if (ipReq){
        var id_utiliz=req.session.utilizator?req.session.utilizator.id:null;
        client.query(comanda_param, [ipReq, id_utiliz, req.url], function(err, rez){
            if(err) console.log(err);
        });
    }
    next();   
}); 

function stergeAccesariVechi(){
    let comanda= `delete from accesari where now() - data_accesare > interval '10 minutes'`;
    client.query(comanda, function(err, rez){
        if(err) console.log(err);
    });
    
}

function stergeIpuriBlocate(){
    let timp_curent=new Date();
    for( let ipa in ipuri_active){
        if (timp_curent-ipuri_active[ipa].data>2*60*1000){ 
            console.log("Am deblocat ", ipa);
            delete ipuri_active[ipa];
        }
    }
}
stergeAccesariVechi();
setInterval(stergeAccesariVechi,10*60*1000);
setInterval(stergeIpuriBlocate,2*60*1000);

app.get(["/produse"], function (req, res) {
    var conditie=""
    if(req.query.tip)
        conditie+=` and tip_macheta='${req.query.tip}'`;
    client.query(`select * from machete where 1=1 ${conditie}`, function(err,rez){       
        if (!err){
            client.query("select * from unnest(enum_range(null::categ_macheta))", function(errCateg, rezCateg){          
                v_optiuni=[];
                for(let elem of rezCateg.rows){
                    v_optiuni.push(elem.unnest);
                }
                res.render("pagini/produse",{produse:rez.rows, optiuni:v_optiuni});
            })          
        }
        else{
            randeazaEroare(res, 2);
        }
    }) 
});
app.get("/produs/:id", function(req, res){
    client.query(`select * from machete where id=${req.params.id}`, function(err,rez){
        if (!err){   
            res.render("pagini/produs",{prod:rez.rows[0]});
        }
        else{
            console.log(err);
            randeazaEroare(res, 2);
        }
    })
})

async function trimitefactura(username, email,numefis){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{ 
			user:"******************@gmail.com",	
            pass:"*********"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	await transp.sendMail({
		from:"******************@gmail.com",
		to:email,
		subject:"Factură",
		text:"Stimate "+username+", aveți atașată factura",
		html:"<h1>Salut!</h1><p>Stimate "+username+", aveți atașată factura</p>",
        attachments: [
            {  
                filename: 'factura.pdf',
                content: fs.readFileSync(numefis)
            }
        ]
	})
	console.log("trimis mail");
}

app.post("/produse_cos",function(req, res){
    var iduri=[]
    for (let elem of req.body.ids_prod){
        let num=parseInt(elem);
        if (!isNaN(num))
            iduri.push(num);
    }
    if (iduri.length==0){
        res.send("eroare");
        return;
    }
    client.query("select id, nume, pret, scara, materiale, categorie, imagine from machete where id in ("+iduri+")", function(err,rez){
        res.send(rez.rows);  
    });  
});

app.post("/cumpara",function(req, res){
    if(!req.session.utilizator){
        res.write("Nu puteti cumpara daca nu sunteti logat!");res.end();
        return;
    }
   
    client.query("select id, nume, pret, scara, materiale, categorie, imagine from machete where id in (" + req.body.ids_prod + ")", function (err, rez) {
        let rezFactura = ejs.render(fs.readFileSync("views/pagini/factura.ejs").toString("utf8"), {
            utilizator: req.session.utilizator,
            produse: rez.rows, protocol: protocol, domeniu: numeDomeniu
        });
        let options = { format: 'A4', args: ['--no-sandbox', '--disable-extensions',  '--disable-setuid-sandbox'] };
        let file = { content: juice(rezFactura, {inlinePseudoElements:true}) };
        html_to_pdf.generatePdf(file, options).then(function(pdf) {
            if(!fs.existsSync("./temp"))
                fs.mkdirSync("./temp");
            var numefis="./temp/test"+(new Date()).getTime()+".pdf";
            fs.writeFileSync(numefis,pdf);
            trimitefactura(req.session.utilizator.username, req.session.utilizator.email, numefis);
            res.write("Factura a fost generata!");res.end();
        });
    });   
});

app.get(["/","/index","/home"], function(req,res){
    client.query("select username, nume from utilizatori where id in (select distinct user_id from accesari where now() - data_accesare < interval '5 minutes' )").then(function(rezultat){
        var evenimente=[]
        var locatie = "";    
        client.query('select * from machete', function (err, rez) {
            res.render("pagini/index", {
                evenimente: evenimente, locatie: locatie, utiliz_online: rezultat.rows, ip: getIp(req), imagini: obGlobal.obImagini.imagini,
                cale: obGlobal.obImagini.cale_galerie, imgCarusel: rez.rows
            });
            req.session.a = "ceva";
    
            console.log("dupa", req.session.mesajLogin);
        })
    }, function(err){console.log("eroare",err)});
});

sirAlphaNum="";
v_intervale=[[48,57],[65,90],[97,122]];
for (let interval of v_intervale){
    for (let i=interval[0];i<=interval[1];i++)
        sirAlphaNum+=String.fromCharCode(i);
}
sirAlpha="";
interval=[97,122];
 for (let i=interval[0];i<=interval[1];i++)
        sirAlpha+=String.fromCharCode(i);

console.log(sirAlpha);


function genereazaToken(lungime){
    sirAleator1 = "";
    sirAleator2 ="";
    for(let i=0;i<lungime; i++){
        sirAleator1+= sirAlphaNum[ Math.floor( Math.random()* sirAlphaNum.length) ];
    }
    for(let i=0;i<lungime; i++){
        sirAleator2+= sirAlphaNum[ Math.floor( Math.random()* sirAlphaNum.length) ];
    }
    sirAleator = sirAleator1.concat("-", sirAleator2);
    return sirAleator;
}
function ParolaCriptare(lungime) {
    parolaCript ="";
    for(let i=0;i<lungime; i++){
        parolaCript+= sirAlpha[ Math.floor( Math.random()* sirAlpha.length) ];
    }
    return parolaCript;
}
ParolaCriptare(10);
console.log(parolaCript);
parolaCriptare="criptare";

async function trimiteMail(prenume, username, email, token){
	var transp= nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth:{
			user:"******************@gmail.com",
            pass:"*********"
		},
		tls:{
			rejectUnauthorized:false
		}
	});
	await transp.sendMail({
		from:"******************@gmail.com",
		to:email,
		subject:"Te-ai inregistrat cu succes",
		text:"Username-ul tau este "+username,
		html:`<h1>Buna ${prenume}</h1><p style='color:green'>Contul tau a fost creat cu succes!</p><p>Username-ul tau este ${username}.</p> <p style='color:blue'><a href='http://${numeDomeniu}/cod_mail/${token}/${username}'>Click aici pentru confirmare</a></p>`,
	})
	console.log("trimis mail");
}

app.get("/cod_mail/:token/:username", function(req,res){
    var queryUpdate=`update utilizatori set confirmat_mail=true where username = '${req.params.username}' and cod_mail= '${req.params.token}' `;
    client.query(queryUpdate, function(err, rez){
        if (err){
            console.log(err);
            randeazaEroare(res, 2);
            return;
        }
        if (rez.rowCount>0){
            res.render("pagini/confirmare");
        }
        else{
            randeazaEroare(res, 2, "Eroare link confirmare", "Nu e userul sau linkul corect");
        }
    });
});

app.post("/login", function(req, res){
    var formular= new formidable.IncomingForm();
    formular.parse(req,function(err, campuriText, campuriFile){
        var querylogin=`select * from utilizatori where username= '${campuriText.username}' `;
        client.query(querylogin, function(err, rez){
            if(err){
                randeazaEroare(res, 2);
                return;
            }
            if (rez.rows.length!=1){//ar trebui sa fie 0
                   randeazaEroare(res, 2, "Eroare login", "Username-ul nu exista.");
                return;
            }
                
             var criptareParola=crypto.scryptSync(campuriText.parola,rez.rows[0].criptare,32).toString('hex'); 
            if (criptareParola == rez.rows[0].parola && rez.rows[0].confirmat_mail) {
                console.log("totul ok");
                req.session.mesajLogin = null;  //resetez in caz ca s-a logat gresit ultima oara
                if (req.session) {
                    if (rez.rows.length == 1) {
                        req.session.utilizator = {
                            id: rez.rows[0].id,
                            username: rez.rows[0].username,
                            nume: rez.rows[0].nume,
                            prenume: rez.rows[0].prenume,
                            culoare_chat: rez.rows[0].culoare_chat,
                            email: rez.rows[0].email,
                            rol: rez.rows[0].rol
                        }
                    }                    
                    res.redirect("/index");
                }
            }
            else{
                req.session.mesajLogin="Login esuat (poate nu ati confirmat pe mail contul";
                res.redirect("/index");
                }

        });
        

    });
});

app.post("/inreg", function(req, res){
    var formular= new formidable.IncomingForm();
    var username;
    formular.parse(req, function (err, campuriText, campuriFile) {
      
        var eroare="";
        if (!campuriText.username)
            eroare += "Username-ul nu poate fi necompletat. ";
            if (!campuriText.nume)
            eroare += "Numele trebuie completat. ";
            if (!campuriText.prenume)
            eroare += "Preumele trebuie necompletat. ";
           if (!campuriText.parola)
            eroare += "Parola nu poate fi necompletata. ";
            if (!campuriText.email)
            eroare += "Email-ul nu poate fi necompletat. ";

        if ( !campuriText.username.match("^[A-Za-z0-9]+$"))
            eroare += "Username-ul trebuie sa contina doar litere mici/mari si cifre. ";
            if ( !campuriText.prenume.match("^[A-Z][a-z]+([-\.][A-Z][a-z]+)?"))
            eroare += "Prenumele nu trebuie sa contina cifre sau caractere speciale. ";
            if ( !campuriText.nume.match("^[A-Z][a-z]+"))
            eroare += "Prenumele trebuie sa contina doar litere mici/mari";

        if (eroare!=""){
            res.render("pagini/inregistrare",{err:eroare});
            return;
        }

        queryVerifUtiliz=` select * from utilizatori where username= '${campuriText.username}' `;
        client.query(queryVerifUtiliz, function(err, rez){
            if (err){
                console.log(err);
                res.render("pagini/inregistrare",{err:"Eroare baza date"});
            }
            else{
                if (rez.rows.length==0){
                    var parolaCriptare = ParolaCriptare(10)
                    var criptareParola = crypto.scryptSync(campuriText.parola, parolaCriptare, 32).toString('hex');
                    var token = genereazaToken(50);
                    console.log(token);
                    var queryUtiliz='insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, cod_mail, criptare) values ($1::text, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text)'; 
                    client.query(queryUtiliz, [campuriText.username, campuriText.nume, campuriText.prenume, criptareParola, campuriText.email, campuriText.culoare_chat, token, parolaCriptare], function(err, rez){ 
                        if (err){
                            console.log("eroare: ",err);
                            res.render("pagini/inregistrare",{err:"Eroare baza date"});
                        }
                        else{
                            trimiteMail(campuriText.prenume, campuriText.username,campuriText.email, token);
                            res.render("pagini/inregistrare",{raspuns:"", raspuns:"Date introduse"});
                        }
                    });
                }
                else{
                    eroare+="Username-ul mai exista. ";
                    res.render("pagini/inregistrare",{raspuns:eroare});
                }
            }
        });
     });  
    formular.on("field", function(nume,val){  
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        if(!fisier.originalFilename)
            return;
        folderUtilizator=__dirname+"/poze_uploadate/"+username+"/";
        if (!fs.existsSync(folderUtilizator)){
            fs.mkdirSync(folderUtilizator);
            v=fisier.originalFilename.split(".");
            fisier.filepath=folderUtilizator+"poza."+v[v.length-1];
        }
        
    })    
    formular.on("file", function(nume,fisier){
        console.log("fisier uploadat");
    });        
});


app.post("/profil", function (req, res) {
    if (!req.session.utilizator){
        res.render("pagini/eroare",{mesaj:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();

    formular.parse(req,function(err, campuriText, campuriFile){
        
        var queryCriptare = 'select * from utilizatori where username=$1::text';
     client.query(queryCriptare, [campuriText.username], function (err, rezCrypto) {
        var criptareParola=crypto.scryptSync(campuriText.parola,rezCrypto.rows[0].criptare,32).toString('hex'); 
        var queryUpdate=`update utilizatori set nume=$1::text, prenume=$2::text, email=$3::text, culoare_chat=$4::text where username= $5::text and parola=$6::text `;
        
        client.query(queryUpdate, [campuriText.nume, campuriText.prenume, campuriText.email, campuriText.culoare_chat, req.session.utilizator.username, criptareParola], function(err, rez){
            if(err){
                console.log(err);
                res.render("pagini/eroare",{mesaj:"Eroare baza date. Incercati mai tarziu."});
                return;
            }
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            req.session.utilizator.nume=campuriText.nume;
            req.session.utilizator.prenume=campuriText.prenume;
            req.session.utilizator.culoare_chat=campuriText.culoare_chat;
            req.session.utilizator.email=campuriText.email;
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
        });
     });

    });
});

app.get("/logout",function(req,res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.redirect("/index");
});

app.get('/useri', function(req, res){	
	if( req.session && req.session.utilizator && (req.session.utilizator.rol=="admin" || req.session.utilizator.rol=="moderator")){
        client.query("select * from utilizatori",function(err, rezultat){
            if(err) throw err;
            res.render('pagini/useri',{useri:rezultat.rows, acces:req.session.utilizator.rol});//afisez index-ul in acest caz
        });
	} 
    else{
        randeazaEroare(res,403);
	}  
});

app.post("/modif_utiliz",function(req, res){
	if( req.session && req.session.utilizator && (req.session.utilizator.rol=="admin" || req.session.utilizator.rol=="moderator")){
	var formular= new formidable.IncomingForm()
	
	formular.parse(req, function(err, campuriText, campuriFisier){
		var modificare = "comun";
        var tipModif = "avansat";
        if(campuriText.rol_utiliz == "comun"){
             modificare ="admin";
            tipModif = "retrogradat";
            }
        // console.log("aici",);
        var comanda=`update  utilizatori set rol=$1::roluri where id=$2`;
		client.query(comanda, [modificare, campuriText.id_utiliz] ,  function(err, rez){
            // 
			// TO DO mesaj cu stergerea
            if(err)
            res.render("pagini/useri",{err:"Eroare baza date. Incercati mai tarziu!."});
            else{
                if (rez.rowCount>0){
                    res.render("pagini/useri",{mesaj:"Modificat cu succes!."});
                   
                }
                else{
                    res.render("pagini/useri",{mesaj:"Modificare esuata!."});
                }
            }
            var token = genereazaToken(50);
            
            trimiteMailul(campuriText.prenume_utiliz,campuriText.nume_utiliz,campuriText.rol_utiliz,campuriText.mail_utiliz,campuriText.id_utiliz,tipModif,token);
		});
       async function trimiteMailul(prenume,nume,rol,email,id,modif,toke){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:"******************@gmail.com",
                //pass:"tehniciweb"
                pass:"*********"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:"*********@gmail.com",
            to:email,
            subject:"Modificare rol",
            text:"Numele-ul tau este "+nume,
            html:`<h1>Buna ziua ${nume}</h1><p style='color:blue'>Va informam ca </p><p>a-ti fost ${modif} la calitatea de ${rol}.`,
        })
       }
	}); 
	}
	res.redirect("/useri");	
});

app.get("/favicon.ico",function(req,res){
    res.sendFile("./resurse/ico/favicon.ico");
});


app.get("/*.ejs", function(req, res){
    randeazaEroare(res,403);
})

app.get("/*", function (req, res) {
    
    
    res.render("pagini" + req.url, {imagini: obGlobal.obImagini.imagini} , function (err,rezRandare) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                
                randeazaEroare(res, 404);
            }
            else {
                res.render("pagini/eroare");
            }
        }
        else {
            res.send(rezRandare);
        }
    
    });
   
});
function creaza_imagini() {
    const citireJson = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini = JSON.parse(citireJson);     
    for (let imag of obGlobal.obImagini.imagini) {
        imag.mare = path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
        let nume_fisier, extensie;
        [nume_fisier, extensie] = imag.fisier.split(".");
        

        let dim = 200;
        imag.mediu = path.join(obGlobal.obImagini.cale_galerie, "mediu", `${nume_fisier}-${dim}.${extensie}`);
        sharp(imag.mare).resize(dim).toFile(imag.mediu, function (err, info) { 
            if (err)
                console.log("Eroare sharp", err);
        });
        dim = 150; 
        imag.mic = path.join(obGlobal.obImagini.cale_galerie, "mic", `${nume_fisier}-${dim}.webp`);
        sharp(imag.mare).resize(dim).toFile(imag.mic, function (err, info) { 
            if (err)
                console.log("Eroare sharp", err);
        });
    }
}

creaza_imagini();

function creeazaErori(){
    var continutFisier= fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf8");
    
    obGlobal.obErori=JSON.parse(continutFisier);
    
}
creeazaErori();

function randeazaEroare(res, identificator=-1, titlu, text, imagine){
    var eroare= obGlobal.obErori.erori.find(function(elem){ return elem.identificator == identificator })
    titlu= titlu || (eroare && eroare.titlu) || obGlobal.obErori.eroare_default.titlu;
    text= text || (eroare && eroare.text) || obGlobal.obErori.eroare_default.text;
    imagine= imagine || (eroare && path.join(obGlobal.obErori.cale_baza,eroare.imagine)) 
        || path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    if(eroare && eroare.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare_generala",{titlu:titlu, text:text, imagine:imagine });
}

var s_port= 8080;
app.listen(s_port);
console.log("serverul a pornit !");



