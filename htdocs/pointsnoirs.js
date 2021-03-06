function annuler(id_espece) {
	var my_i = new Array();
	for (var i=0;i<inventaires.length;i++) {
		if( inventaires[i].id_espece != id_espece) {
			my_i.push(inventaires[i]);
		}
	}
	inventaires = my_i;
	actualise_tableau();
}

function terminer() {
	var args = $('#fa').serialize();

	var args_sup = {};
	for (var i=0;i<inventaires.length;i++) {
		args_sup['id_espece_'+i] = inventaires[i].id_espece;
		args_sup['n_mort_'+i] = inventaires[i].nb_mort;
		args_sup['n_vivant_'+i] = inventaires[i].nb_vivant;
		args_sup['indice_q_mort_'+i] = inventaires[i].indice_q_mort;
		args_sup['indice_q_vivant_'+i] = inventaires[i].indice_q_vivant;
		args_sup['commentaire_'+i] = inventaires[i].commentaire;
	}
	url = '?p=enregistre&'+args+'&'+$.param(args_sup);
	document.location.href = url;
	$('#choix_especes').hide();
}

function set_fiche_id_espece(id) {
	set_fiche_id_espece_nom(id, $('#e'+id).html());
}

function set_fiche_id_espece_nom(id,nom) {
	var i;
	for (i=0;i<inventaires.length;i++) {
		if (inventaires[i].id_espece == id) {
			alert('Espèce déjà enregistrée');
			return;
		}
	}
	$('#fiche_nom_espece').html(nom);
	$('#fiche_id_espece').val(id);
	$('#fiche_nb_morts').val('');
	$('#fiche_nb_vivants').val('');
	$('#fiche_commentaire').val('');
	$('#fiche').show();
}

function Inventaire(id_espece,nom,nb_mort,nb_vivant,indice_q_mort,indice_q_vivant,commentaire) {
	this.id_espece = id_espece;
	this.nom = nom;
	
	if (isNaN(nb_mort)) this.nb_mort = 0;
	else this.nb_mort = nb_mort;

	if (isNaN(nb_vivant)) this.nb_vivant = 0;
	else this.nb_vivant = nb_vivant;

	if (isNaN(indice_q_mort)) this.indice_q_mort = 4;
	else this.indice_q_mort = indice_q_mort;

	if (isNaN(indice_q_vivant)) this.indice_q_vivant = 4;
	else this.indice_q_vivant = indice_q_vivant;

	this.commentaire = commentaire;

	this.texte = function () {
		var txt = this.nom+' ';

		if (this.nb_mort > 0)
			txt += this.nb_mort+' mort';

		if (this.nb_mort > 1) txt += 's ';
		else txt += ' ';

		if (this.nb_vivant > 0)
			txt += this.nb_vivant+' vivant';
		if (this.nb_vivant > 1) txt += 's ';
		else txt += ' ';
		return txt;
	}
}

function page_carte_init(install) {
	page_accueil_maj_fond();
	var fond = new ol.layer.Tile({ 
		source: new ol.source.TileWMS({ 
			projection: 'EPSG:3857', 
			url: "http://osm.picnat.fr/mapproxy/service", 
			params: { 
				LAYERS: 'bright' 
			},
			attributions: [new ol.Attribution({html: '<a href="http://www.clicnat.fr/">Openstreetmap</a> et ses contributeurs'})]
		})
	});
	var vecteur = new ol.layer.Vector({
		source: new ol.source.Vector({
			url: '?p=geojson',
			format: new ol.format.GeoJSON(),
			attributions: [new ol.Attribution({html: '<a href="http://www.clicnat.fr/">Clicnat</a>'})]
		}),
		style: function (feature, resolution) {
			var style;
			switch (feature.get('reseau')) {
				case 'av':
					style = new ol.style.Style({ 
						image: new ol.style.Icon({
							src: 'image/icones/oiseau.png',
							scale: resolution>10?0.5:1,
							anchor: [0,1]
						})
					});
					break;
				case 'ar':
					style = new ol.style.Style({ 
						image: new ol.style.Icon({
							src: 'image/icones/amphibien.png',
							scale: resolution>10?0.5:1,
							anchor: [1,0]
						})
					});
					break;
				case 'mt':
					style = new ol.style.Style({ 
						image: new ol.style.Icon({
							src: 'image/icones/mammifere.png',
							scale: resolution>10?0.5:1,
							anchor: [1,1]
						})
					});
					break;
				default:
					return;
					/*
					style = new ol.style.Style({ 
						image: new ol.style.Circle({
							radius: 6,
							fill: new ol.style.Fill({ color: '#aeff43' }),
							stroke: new ol.style.Stroke({ color: '#bfff89', width: 2 }) 
						}),
						text: new ol.style.Text({text: feature.get('reseau')})
					});
					*/

			}
			return [style];
		}
	});
	var olMapDiv = document.getElementById('carte2');
	xorg = false;
	if (install == 'picnat') {
		xorg = [256066.43341247435, 6429073.462702302];
		zoom = 10;
	} else if (install == 'mayenne') {
		xorg = [-69109, 6157382];
		zoom = 10;
	}
	if (!xorg) {
		console.log("coordonnées d'origine non définies");
		alert('erreur coords org');
		return false;
	}
	carte = new ol.Map({
		layers: [fond,vecteur],
		target: olMapDiv,
		view: new ol.View({
			center: xorg,
			zoom: zoom
	        })
	});
}	

function init_carte(id_map, install) {
	var styles = [ 'Road', 'Aerial', 'AerialWithLabels', 'collinsBart', 'ordnanceSurvey' ];
	var bing = new ol.layer.Tile({ 
		visible: true,
		preload: Infinity,
		source: new ol.source.BingMaps({
			key: 'Ah-gSVhOCszl1-LJ6d1gs11SXprWx2-BM6GUkUiqcDAmRWEgV2tNQ_1a7M2wJ33t',
			imagerySet: styles[2]
		})
	});
	// layer est une variable globale
	var style = new ol.style.Style({ 
		image: new ol.style.Circle({
			radius: 6,
			fill: new ol.style.Fill({ color: '#aeff43' }),
			stroke: new ol.style.Stroke({ color: '#bfff89', width: 2 }) 
		})
	});

	layer = new ol.layer.Vector({
		source: new ol.source.Vector(),
		style: style,
		attribution: new ol.Attribution({html: '<a href="http://www.clicnat.fr/">Clicnat</a>'})
	});

	var view = new ol.View({
		// make sure the view doesn't go beyond the 22 zoom levels of Google Maps
		maxZoom: 19
	});

	var olMapDiv = document.getElementById('olmap');
	xorg = false;
	if (install == 'picnat') {
		xorg = [256066.43341247435, 6429073.462702302];
		zoom = 10;
	} else if (install == 'mayenne') {
		xorg = [-69109, 6157382];
		zoom = 10;
	}
	if (!xorg) {
		console.log("coordonnées d'origine non définies");
		alert('erreur coords org');
		return false;
	}
	carte = new ol.Map({
		layers: [bing,layer],
		target: olMapDiv,
		view: new ol.View({
			center: xorg,
			zoom: zoom
	        })
	});

	carte.on('click', function (e) {
		var zoom = e.map.getView().getZoom();
		if (zoom < 15) {
			$('#statut_zoom_plus').show();
			$('#statut_zoom_ok').hide();
		} else {
			var pt = e.map.getCoordinateFromPixel(e.pixel);
			marque_point(pt);
			var lonlat = ol.proj.toLonLat(pt, e.map.getView().getProjection());
			$('#f_lon').val(lonlat[0]);
			$('#f_lat').val(lonlat[1]);

			$('#statut_click').html("Vous pouvez passer à l'étape C");

			$('.saisieinfo').css('display', 'block');
			$('#f_date').focus();
			$('#fa').submit(function (event) {
				event.preventDefault();
				try {
					var elems = $(this).children("[name]");
					for (var i=0; i<elems.length; i++) {
						switch ($(elems[i]).attr('name')) {
							case 'nom':
							case 'prenom':
							case 'email':
							case 'ville':
							case 'date':
								var v = $(elems[i]).val();
								if (v.length == 0) {
									alert('Le champ '+$(elems[i]).attr('name')+' est obligatoire');
									return false;
								}
								break;
						}
					}
				} catch (e) {
					alert("Une erreur a bloqué l'envoi du formulaire");
					return false;
				}
				$('.obsespeces').css('display', 'block');
				$('#recherche_esp').focus();
				return false;
			});


		}
	});
	carte.on('moveend', function (e) {
		var zoom = e.map.getView().getZoom();
		var n = 15 - zoom;
		if (zoom < 15) {
			if (n>1) 
				$('#statut_zoom_info').html('<div class="alert alert-danger">Il reste '+n+' niveaux de zoom a traverser</div>');
			else 
				$('#statut_zoom_info').html('<div class="alert alert-warning">Il reste un dernier niveau de zoom a traverser</div>');
			$('#statut_zoom_ok').hide();
		} else {
			$('#statut_zoom_plus').hide();
			$('#statut_zoom_ok').show();
			$('#statut_zoom_info').html('');
		}
	});
}

function marque_point(p) {
	var feature = new ol.Feature({
		geometry: new ol.geom.Point(p),
	    	name: 'Point observation'
	});
	var source = layer.getSource();
	source.clear();
	source.addFeature(feature);
	feature.changed();
}

function page_accueil_fermer_forms() {
	$('.formulaire').hide();
}

var img_fond = 0;
function page_accueil_maj_fond() {
	var images = ['image/banniere_fond_a.jpg','image/banniere_fond_b.jpg','image/banniere_fond_c.jpg'];
	img_fond = (img_fond + 1) % images.length;
	$('#banniere_ar').css('backgroundImage', 'url("'+images[img_fond]+'")');
	setTimeout("page_accueil_maj_fond()", 15000);
}

var page_accueil_glob_img_pos = 0;
var carte;
var layer;
var inventaires = new Array();
var commentaire_observateur = "";

function actualise_tableau() {
	$('#tableau').html('');

	for (var i=0; i<inventaires.length; i++) {
		$('#tableau').append(inventaires[i].texte());
		$('#tableau').append(' <a class="btn btn-info btn-xs" href="javascript:annuler('+inventaires[i].id_espece+');">retirer</a>');
		$('#tableau').append("<br/>");
	}

	$('#tableau').append("<br/><a class='btn btn-primary' href=javascript:terminer();>Envoyer vos observations</a><br/>");
	$('#tableau').append("Vous pouvez aussi ajouter une autre espèce en cliquant dans la liste à gauche");
}
function page_complements_init(){
	 page_accueil_maj_fond();
}
	
function page_actu_init(){
	 page_accueil_maj_fond();
	 var articles = $('#bloc-actu').find('article');
	 $('.bloc-actu-pre').has('img').height('150px');
}

function page_accueil_init(install) {
	page_accueil_maj_fond();
	carte = init_carte('bloc-b-carte-in',install);

	$.datepicker.setDefaults($.datepicker.regional['fr']);
	var d = $('#f_date');
	d.datepicker({maxDate: 0});
	d.datepicker("option","fr");
	$('.carousel').carousel();

	$('#ffiche').submit(function (event) {
		event.preventDefault();
		try {
			var iv = new Inventaire(
				$('#fiche_id_espece').val(),
				$('#fiche_nom_espece').html(),
				$('#fiche_nb_morts').val(),
				$('#fiche_nb_vivants').val(),
				$('#f_niveau_certitude_morts').val(),
				$('#f_niveau_certitude_vivants').val(),
				$('#fiche_commentaire').val()
			);
			if (iv.nb_mort == "" && iv.nb_vivant == "") {
				alert('Effectifs vides');
				return false;
			}
			$('#fiche').hide();
			inventaires.push(iv);
			actualise_tableau();
		} catch (e) {
			alert(e);
			return false;
		}
		return false;
	});
}
