
            function zero(nr){
                if (nr<10) return "0"+nr;
                return nr;
            }
            
            d=new Date()
            document.getElementById("data_client").innerHTML=zero(d.getHours())+":"+zero(d.getMinutes())+":"+zero(d.getSeconds());

            function actualizeazaElemData(id_div){
                var data_div=document.getElementById(id_div);
                if (data_div.innerHTML!="")
                {
                    var timp=data_div.innerHTML.split(":")
                    var dt=new Date(2000,1,15, timp[0],timp[1], timp[2] );//nu conteaza data (am pus valori random pentru an, luna si zi) ci timpul
                }
                else
                    var dt=new Date();
                dt.setSeconds(dt.getSeconds()+1)
                data_div.innerHTML=zero(dt.getHours())+":"+zero(dt.getMinutes())+":"+zero(dt.getSeconds());
            }
            function actualizeazaData(){
                actualizeazaElemData("data_client");
                actualizeazaElemData("data_server");
            }
            actualizeazaData()
            setInterval(actualizeazaData,1000)
      