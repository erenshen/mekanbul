const axios = require("axios");
var apiSecenekleri = {
  sunucu: "https://mekanbul.erensenn.repl.co",
  apiYolu:"/api/mekanlar/",
};
var mesafeyiFormatla = function(mesafe){
  var yeniMesafe, birim;
  if(mesafe > 1){
    yeniMesafe = parseFloat(mesafe).toFixed(1);
    birim = "km";
  } else {
    yeniMesafe = parseInt(mesafe * 1000, 10);
    birim = "m";
  }
  return yeniMesafe + birim;
};
var anaSayfaOlustur = function(res, mekanListesi){
  var mesaj;
  if(!(mekanListesi instanceof Array)){
    mesaj = "API HATASI:bir şeyler ters gitti";
    mekanListesi =[];
  } else {
    if(!mekanListesi.length){
      mesaj = "Civarda herhangi bir mekan bulunamadı";
    }
  }
  res.render("anasayfa",{
    baslik: "AnaSayfa",
    sayfaBaslik: {
      siteAd: "MekanBul",
      slogan:"Civardaki Mekanları Keşfet!",
    },
    mekanlar: mekanListesi,
    mesaj: mesaj,
  });
};
const anaSayfa = function (req, res){
  axios.get(apiSecenekleri.sunucu  + apiSecenekleri.apiYolu,{
    params: {
      enlem: req.query.enlem,
      boylam: req.query.boylam,
    },
  }).then(function(response){
    var i,mekanlar;
    mekanlar = response.data;
    for(i=0;i<mekanlar.length;i++){
      mekanlar[i].mesafe=mesafeyiFormatla(mekanlar[i].mesafe);
    }
    anaSayfaOlustur(res,mekanlar);
  }).catch(function (hata){
    anaSayfaOlustur(res, hata)
  });
};
var detaySayfasiOlustur = function(res,mekanDetaylari){
  mekanDetaylari.koordinat={
    "enlem":mekanDetaylari.koordinat[0],
    "boylam":mekanDetaylari.koordinat[1]
  }
  res.render('mekanbilgisi',
  {
    mekanBaslik: mekanDetaylari.ad,
    mekanDetay:mekanDetaylari
  });
}
var hataGoster = function(res,hata){
  var mesaj;
  if(hata.response.status==404){
    mesaj="404,Sayfa Bulunamadı!";
  } else {
    mesaj=hata.response.status+"hatası";
  }
res.status(hata.response.status);
res.render('error',{
  "mesaj":mesaj
});
};
  /*res.render('anasayfa', { "baslik": "Ana Sayfa","sayfaBaslik": {
    "siteAd":"MekanBul",
    "slogan":"Civardaki Mekanları Keşfet!"
  },
  "mekanlar": [
    {
      "ad":"Starbucks",
      "adres":"Centrum Garden AVM",
      "puan":"5",
      "imkanlar": ["Dünya Kahveleri","Kekler","Pastalar"],
      "mesafe":"10km"
    }
    ,
    {
      "ad":"Gloria Jeans",
      "adres":"SDÜ Doğu Kampüsü",
      "puan":"3",
      "imkanlar": ["Kahve","Çay","Pasta"],
      "mesafe":"5km"
    }
  ]
 });
}
*/
const mekanBilgisi = function (req, res) {
  axios
    .get(apiSecenekleri.sunucu + apiSecenekleri.apiYolu + req.params.mekanid)
    .then(function(response){
      req.session.mekanAdi = response.data.ad;
      detaySayfasiOlustur(res, response.data);

    })
    .catch(function(hata){
      hataGoster(res, hata);
    });
};
 

const yorumEkle = function (req, res) {
  var mekanAdi = req.session.mekanAdi;
  mekanid = req.params.mekanid;
  if (!mekanAdi)
  res.redirect("/mekan/" + mekanid);
  else res.render("yorumekle",{
    baslik: mekanAdi + " mekanına yorum ekle"
  });
};

const yorumumuEkle = function(req, res){
  var gonderilenYorum, mekanid;
  mekanid = req.params.mekanid;
  if (!req.body.adsoyad || !req.body.yorum) {
    res.redirect("/mekan/" + mekanid + "/yorum/yeni?hata=evet");
  } else {
    gonderilenYorum = {
      yorumYapan: req.body.adsoyad,
      puan: parseInt(req.body.puan, 10),
      yorumMetni: req.body.yorum,
    };
    axios
      .post(
        apiSecenekleri.sunucu + apiSecenekleri.apiYolu + mekanid + "/yorumlar",
        gonderilenYorum
      )
      .then(function () {
        res.redirect("/mekan/" + mekanid);
      })
      .catch(function (hata) {
        hataGoster(req, res, hata);
      });
  }

};


module.exports = {

  anaSayfa,
  mekanBilgisi,
  yorumEkle,
  anaSayfaOlustur,
  mesafeyiFormatla,
  yorumumuEkle


};