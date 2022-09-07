DROP TYPE IF EXISTS categ_macheta;
DROP TYPE IF EXISTS tip_macheta;

CREATE TYPE tipuri_machete AS ENUM( 'auto', 'avion', 'nave', 'tank', 'machete');
CREATE TYPE categ_macheta AS ENUM( 'comanda speciala', 'editie aniversara', 'editie limitata', 'colectie', 'comuna');

CREATE TABLE IF NOT EXISTS machete (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL DEFAULT 0, 
   categorie categ_macheta NOT NULL DEFAULT 'comuna',
   tip_macheta tipuri_machete DEFAULT 'machete',
   tara VARCHAR(50),
   scara INTEGER DEFAULT 32,
   nivel INTEGER DEFAULT 0,
   materiale VARCHAR [],
   imagine VARCHAR(300),
   stoc BOOLEAN NOT NULL DEFAULT TRUE,
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT into machete (nume,descriere,pret, categorie,tip_macheta,tara, scara, nivel, materiale, imagine,stoc) VALUES 
('Alfa Romeo','Productie: Anglia, autoturism de lux, volan pe dreapta',360.0,'comanda speciala','auto','Anglia',32,110,'{"plastic","metal","cauciuc","lemn","adeziv"}','alfa-romeo-auto-150.webp',True),
('Ferrari F348 Red','Productie: Germania, tractiune spate',260.0,'colectie','auto','Germania',32,170,'{"plastic","metal","cauciuc","adeziv"}','ferrari-f348t-auto-150.webp',True),
('Ford Galaxic','Productie: Romania, 75 CP',305.0,'editie limitata','auto','Romania',32,130,'{"plastic","metal","cauciuc","lemn","adeziv"}','ford-galaxic-auto-150.webp',True),
('Chevrolet limousine','Productie: Italia',190.0,'editie limitata','auto','Italia',32,120,'{"plastic","cauciuc","adeziv"}','chevrolet-oldtimer-auto-150.webp',True),
('Ford Mustang','Productie: Anglia, autoutilitara, capacitate maxima 2.5 tone',560.0,'comanda speciala','auto','Anglia',32,120,'{"plastic","cauciuc","adeziv"}','ford-mustang-auto-150.webp',True),
('Dodge Sheriff','Productie: SUA, autoturism pentru serviciul de politie',290.0,'editie aniversara','auto','SUA',72,200,'{"plastic","metal","textil","cauciuc","adeziv"}','dodge-sheriff-auto-150.webp',True),
('Mercedes Benz 220 S Coupe','Productie: Germania, autoturism de lux',580.0,'colectie','auto','Germania',32,310,'{"metal","cauciuc","adeziv"}','mercedes-220s-auto-150.webp',True),
('Maserati Mistral Cabriolet','Productie: Anglia, turism de transport persoane, 16 locuri',200.0,'editie aniversara','auto','Anglia',32,150,'{"plastic","metal","cauciuc"}','limosine-oldtimers-auto-150.webp',False),
('Opel Record Cabriolet','Productie: Germania, 104 CP',160.0,'comuna','auto','Romania',32,0,'{"plastic","metal","cauciuc"}','opel-cabriolet-auto-150.webp',True),
('Porche 718 Cayman','Productie: Franta, autotractor, capacitate maxima 8 tone',250.0,'comanda speciala','auto','Franta',16,260,'{"metal","cauciuc","adeziv"}','porche-auto-150.webp',True),
('Airbuse-A380','Productie: Franta, capacitate 300 persoane',340.0,'colectie','avion','Franta',72,170,'{"plastic","metal","textil","cauciuc",lemn,"adeziv"}','a380-avion-150.webp',True),
('Avion de vanatoare F22','Productie: USA, avion strategic de lupta',360.0,'editie limitata','avion','USA',72,280,'{"plastic","adeziv"}','f-22-avion-150.webp',True),
('Binomotor cu elice','Productie: Anglia, capacitate 2 persoane',340.0,'editie limitata','avion','Anglia',32,160,'{"plastic","textil","cauciuc",lemn,"adeziv"}','avion2-avion-150.webp',True),
('Avion de vanatoare Mig21','Productie: Rusia, avion de lupta',250.0,'comuna','avion','Franta',32,170,'{"plastic","textil",lemn,"adeziv"}','mig-21-avion-150.webp',True),
('F-117-invizibil','Productie: USA, avion de vanatoare',320.0,'colectie','avion','USA',72,190,'{"plastic","adeziv"}','f117-avion-150.webp',True),
('Messer-Shmith','Productie: Germania, avion de lupta',280.0,'colectie','avion','Germania',32,90,'{"plastic","cauciuc","adeziv"}','avion1-avion-150.webp',True),
('Nava de lupta cu panze','Productie: Anglia, nava de lupta, 22 tunuri',380.0,'comanda speciala','nave','Anglia',32,320,'{"plastic","textil",lemn,"adeziv"}','panze-lupta-nave-150.webp',False),
('Corabie cu panze','Productie: Franta, nava de lupta cu panze, 18 tunuri',360.0,'colectie','nave','Franta',32,220,'{"plastic","textil",lemn,"adeziv"}','panze-nave-150.webp',True),
('Nava de transport marfa','Productie: Anglia, nava de transport marfa, 1500 tone',310.0,'comuna','nave','Anglia',72,95,'{"plastic",lemn,"adeziv"}','nave-marfa-150.webp',True),
('Portavion','Productie: USA, portavion',380.0,'editie aniversara','nave','USA',32,310,'{"plastic","metal","cauciuc",lemn,"adeziv"}','portavion-nave-150.webp',True),
('Nava de croaziera-Titanic','Productie: USA, nava de croaziera, capacitate 300 persoane',380.0,'editie aniversara','nave','USA',32,230,'{"plastic","adeziv"}','titanic-nave-150.webp',True),
('Nava de vikingi','Productie: Norvegia, nava vikinga de lupta',350.0,'comanda speciala','nave','Norvegia',32,140,'{"plastic","textil",lemn}','nave-viking-150.webp',False),
('Tank T34','Productie: Germania, tank greu, tun 110mm',290.0,'comuna','tank','Germania',32,140,'{"plastic","metal","cauciuc","adeziv"}','t-34-tank-150.webp',True),
('Tank T55','Productie: Anglia, tank mediu, tun 90mm',310.0,'editie limitata','tank','Anglia',32,255,'{"plastic","cauciuc"}','t-55r-tank-150.webp',True),
('Tank','Productie: Franta, tank greu, tun 110mm',270.0,'comuna','tank','Franta',72,170,'{"plastic","cauciuc","adeziv"}','tank1-tank-150.webp',True),
('Tank Panzer','Productie: USA, tank greu, tun 110mm',290.0,'comuna','tank','USA',32,120,'{"plastic","cauciuc","adeziv"}','panzer-tank-150.webp',True),
('Tank Bradley','Productie: Rusia, tank greu, tun 120mm',290.0,'editie limitata','tank','Rusia',32,330,'{"plastic","metal","cauciuc"}','bradley-tank-150.webp',True),
('Tank Obj-315','Productie: Rusia, tank greu, tun 105mm',320.0,'comanda speciala','tank','Rusia',32,290,'{"metal","cauciuc","adeziv"}','obj315r-tank-150.webp',True),
('Tank Abrams M1','Productie: SUA, tank greu, tun 110mm',320.0,'colectie','tank','Germania',72,360,'{"plastic","metal","cauciuc","adeziv"}','abrams-m1-tank-150.webp',True),
('Audi 50','Productie: Germania, 1975',225.0,'comuna','auto','Germania',16,210,'{"plastic","cauciuc","adeziv"}','audi 50-auto-150.webp',True),
('Avion bibotor','Productie:Anglia, doua motoare cu elice',220.0,'editie limitata','avion','Anglia',72,280,'{"plastic","cauciuc"}','avion3-avion-150.webp',False)





