"use strict";
/*global Chartist*/

var carPos = {
	neuf : {
		deltaNextPos : {
			top : 0.63,
			left : 1.05
		},
		col : [
			{
				origine : {
					top : 40.7,
					left : 32
				},
				nbPlace : 11
			},
			{
				origine : {
					top : 38.7,
					left : 38
				},
				nbPlace : 8
			},
			{
				origine : {
					top : 37.2,
					left : 40
				},
				nbPlace : 8
			},
			{
				origine : {
					top : 34.3,
					left : 43.2
				},
				nbPlace : 9
			}
		]
	},
	occasion : {
		deltaNextPos : {
			top : 0.64,
			left : 1.06
		},
		col : [
			{
				origine : {
					top : 49.7,
					left : 51.2
				},
				nbPlace : 1
			},
			{
				origine : {
					top : 52.2,
					left : 55.3
				},
				nbPlace : 6
			},
			{
				origine : {
					top : 47.5,
					left : 55.8
				},
				nbPlace : 7
			},
			{
				origine : {
					top : 46.2,
					left : 57.9
				},
				nbPlace : 7
			},
			{
				origine : {
					top : 43.5,
					left : 60.4
				},
				nbPlace : 10
			}
		]
	}
};

var allPlaces = {};
var nbMaxPlaces = null;

function requestData(type, callback){
    callback();
}

function testRequestedData(type, callback){
	if(!data[type]) requestData(type, callback);
	else callback();
}

function requestGeneratePhrase(categorie, annee){ 
	if(!data[categorie]) requestData(categorie, function(){ generatePhrase(categorie, annee); });
	else generatePhrase(categorie, annee);
}
function requestChartCarburant(year){ 
	if(!data["carburant"]) requestData("carburant", function(){ generateBarChart(data.carburant.data[year]); });
	else generateBarChart(data.carburant.data[year]);
}
function requestGenerateParcDonutCars(type, year){ 
	if(!data["parc"]) requestData("parc", function(){ generateParcDonutCars(data.parc.data[year][type].pourcentage, type); });
	else generateParcDonutCars(data.parc.data[year][type].pourcentage, type);
}
function requestGenerateInfo(categorie, year, slideId){
	if(!data[categorie]) requestData(categorie, function(){ generateInfo(data[categorie].yearsComments[year], slideId); });
	else generateInfo(data[categorie].yearsComments[year], slideId);
}
function requestGenerateMenageDonut(type, year){ 
	if(!data["menage"]) requestData("menage", function(){ generateDonut(data.menage.data[year][type].pourcentage, type); });
	else generateDonut(data.menage.data[year][type].pourcentage, type);
}
function requestGenerateChartDefilement(categorie){ 
	if(!data[categorie]) requestData(categorie, function(){ generateChart(data[categorie]); });
	else generateChart(data[categorie]);
}

function generatePhrase(type, annee){
	switch(type){
		case "menage":
			var pourcentage = Math.round(data.menage.data[annee].biPlus.pourcentage + data.menage.data[annee].mono.pourcentage);
				$("#phraseMenage p").html("En "+annee+", il y avait "+pourcentage+"% de ménages motorisés.");
			break;
		case "parc":
			$("#phraseDetention p").html("En "+annee+",les français gardaient leur voiture "+data.menage.data[annee].detention.val+" ans en moyenne.");
			break;

		case "carburant":
			var cleanEnergies = ["electricite","hybride","gaz","superethanol","bicarburant"];
			var value = 0;
			cleanEnergies.forEach(function(carburant){
				value += data.carburant.data[annee][carburant].pourcentage;
			});
			$("#phraseCarburant p").html("En "+annee+", "+Math.round(value*10)/10+" % des voitures vendues utilisaient des énergies propres.");		

			break;
	}
}

function generateInfo(text, slideId){
	$('#'+slideId+" .info p").html(text);
}


function generateChart(donnees){

	var dataChart = generateChartData(donnees);
	var chartId = "#chart"+donnees.categorie;
	var chartLabel;

	var options = fillOptions(chartLabel);
	var chart = new Chartist.Line(chartId, dataChart, options);

	var seq = 0;
	var delays = 80;
	var durations = 500;

	chart.on('created', function(){
		seq=0;
	});

	chart.on('draw', function(param){
		seq++;

		if(param.type === 'line'){
			setLineAnimation(param, seq, delays, durations);
		}else if(param.type === 'label'){
			if(jQuery.inArray(param.text, donnees.yearsToScreen == -1)){
				setLabelAnimation(param, donnees.categorie);
			}
		}else if(param.type === 'point'){
			setPointAnimation(param,donnees.categorie,seq,delays,durations);
		}
	});
}


function fillOptions(){
	var retour = {
		axisY : { showLabel:false , showGrid:false },
		axisX : { showGrid:false , labelOffset:{ x:-16, y:0 } }, 
		lineSmooth: Chartist.Interpolation.cardinal({ fillHoles:true }),
		chartPadding: { top:5, right:30 , bottom:5 , left:0 } };

	return retour;
}

function generateChartData(donnees){
	
	var dataChart = { labels:[], series:[[]] }; 
	
	for(var i=0; i<donnees.years.length; i++){
		if(i==0){
			if(jQuery.inArray(donnees.years[0], donnees.yearsToScreen) != -1) dataChart.labels.push(donnees.years[0]);
			else(dataChart.labels.push(null));
			dataChart.series[0].push(dataToAdd(donnees, i));
		}
		else{
			for(var j=1; j<donnees.years[i]-donnees.years[i-1]; j++){
				dataChart.labels.push(null);
				dataChart.series[0].push(null);
			}
			if(jQuery.inArray(donnees.years[i], donnees.yearsToScreen) != -1) dataChart.labels.push(donnees.years[i]);
			else(dataChart.labels.push(null));
			dataChart.series[0].push({value : dataToAdd(donnees, i), meta : dataToAdd(donnees, i)});
		}
	}
	return dataChart;
}

function dataToAdd(donnees, index){

	var retour = null;
	switch(donnees.categorie){
		case "menage":
			retour = donnees.data[donnees.years[index]].biPlus.pourcentage + donnees.data[donnees.years[index]].mono.pourcentage;
			break;

		case "carburant":
			retour=0;
			var cleanEnergies = ["electricite","hybride","gaz","superethanol","bicarburant"];
			cleanEnergies.forEach(function(carburant){
				retour += donnees.data[donnees.years[index]][carburant].pourcentage;
			});
			break;

		case "parc":
			retour = data.menage.data[donnees.years[index]].detention.val;

			break;
	}
	return retour;
}

function setLineAnimation(param, seq, delay, duration){
	param.element.animate({
		opacity : {
			begin : seq * delay + 100,
			dur : duration,
			from : 0,
			to : 1
		}
	});
}

function setLabelAnimation(param, categorie){

	var id = "label"+categorie+param.text;
	
	param.element.attr({id : id});
	
	var labelParent = $("#"+id);
	var label = labelParent.children();

	var labelParentOriginPos = {
		x : parseInt(labelParent.attr("x").replace("px",""), 10),
		y : parseInt(labelParent.attr("y").replace("px",""), 10)
	};

	//var labelParentOriginPos = labelParent.position();
	label.mouseenter(function(node){
		//Grossissement et changement de couleur du point
		//var point = label.parent().parent().parent().find('.ct-point[year="'+param.text+'"][categorie="'+categorie+'"]');
		
		var point = $("#"+"point"+categorie+param.text);
		point.stop().animate({
			"stroke-width" : 20,
			opacity : 0
		}, 300);
		//Grossissement du label
		$(this).stop().animate({
			fontSize: "3vmin",
			}, 300 );

		//Décalage à gauche au fur et à mesure du grossissement du label
		$(this).parent().stop().animate({
		x : labelParentOriginPos.x-10+"px",
		y : labelParentOriginPos.y-5+"px"
		}, 300 );
	});
	
	label.mouseleave(function(node){
		//Retrecissement du point et retour à la vouleur d'origine
		//var point = label.parent().parent().parent().find('.ct-point[year="'+param.text+'"]');
		var point = $("#"+"point"+categorie+param.text);
		point.stop().animate({
			"stroke-width" : 10,
			opacity : 1
		}, 300);

		//Retrecissement du label
		$(this).stop().animate({
			fontSize: "2vmin"
			}, 300 );

		//Retrecissement du label et retour à la position d'origine
		$(this).parent().stop().animate({
		x : labelParentOriginPos.x+"px",
		y : labelParentOriginPos.y+"px"
		}, 300 );
	});

	label.click(function(){
		var annee = $(this).html();
		switch(categorie){
			case "menage":
				requestGenerateMenageDonut("mono", annee);
				requestGenerateMenageDonut("biPlus", annee);
				requestGenerateMenageDonut("none", annee);
				requestGenerateInfo(categorie, annee, "s2");
				requestGeneratePhrase("menage", annee)
				break;
			case "parc":
				requestGenerateParcDonutCars("neuf", annee);
				requestGenerateParcDonutCars("occasion", annee);
				requestGenerateInfo(categorie, annee, "s3");
				requestGeneratePhrase("parc", annee);
				break;
			case "carburant":
				requestGenerateInfo(categorie, annee, "s4");
				requestChartCarburant(annee);
				requestGeneratePhrase("carburant", annee)
				break;
		}
	});
}

function setPointAnimation(param, categorie, seq, delay, duration){
	
	var annee = param.axisX.ticks[param.index];
	var id = "point"+categorie+annee;
	
	
	if(!annee) param.element.attr({ opacity : "0"});
	else{
		param.element.attr({ id : id });
	
		param.element.animate({
		      x1: {
		        begin: seq * delay,
		        dur: duration,
		        from: param.x - 10,
		        to: param.x,
		        easing: 'easeOutQuart'
		      },
		      x2: {
		        begin: seq * delay,
		        dur: duration,
		        from: param.x - 10,
		        to: param.x,
		        easing: 'easeOutQuart'
		      },
		      opacity: {
		        begin: seq * delay,
		        dur: duration,
		        from: 0,
		        to: 1,
		        easing: 'easeOutQuart'
		      }
		});
	}
	
}

function relaunchAnimation(index, nextIndex, direction){
	switch(nextIndex){
		case 1:
			animateCloud(".nuage");
			animateImage(".acceuil");
			break;
		case 2:
			requestGenerateChartDefilement("menage");
			requestGenerateMenageDonut("mono", "1990");
			requestGenerateMenageDonut("biPlus", "1990");
			requestGenerateMenageDonut("none", "1990");
			requestGenerateInfo("menage", "1990", "s2");
			animateCloud(".nuage2");
			requestGeneratePhrase("menage", "1990");
			break;
		case 3:
			requestGenerateChartDefilement("parc");
			requestGenerateParcDonutCars("neuf", "1990");
			requestGenerateParcDonutCars("occasion", "1990");
			requestGenerateInfo("parc", "1990", "s3");
			requestGeneratePhrase("parc", "1990");
			break;
		case 4:
			requestGenerateChartDefilement("carburant");
			requestGenerateInfo("carburant", "2009", "s4");
			requestChartCarburant("2009");
			requestGeneratePhrase("carburant", "2009");
			break;
	}
	switch(index){
		case 1:
			animateStop('.nuage');
			animateStop('.acceuil');
			break;
		case 2:
			animateStop('.nuage2');
			break;
		case 3:
			removeAllCars();
			break;
	}
}



function generateDonut(donnee,id){

	var label = '<h3>'+donnee+'%</h3>';
	var idStr = '#'+id;
	var options = fillOptionsDonut(label);

	var chart = new Chartist.Pie(idStr, { series:[donnee] }, options);

	chart.on('draw', function(data) {
		if(data.type === 'slice') {
			setSliceAnimation(data);
	  	}
	});
}

function fillOptionsDonut(label){
	var retour ={
		donut: true,
		showLabel: false,
		total: 100,
		donutWidth: "20%",
		chartPadding: 0,
		startAngle: 190,
		plugins: [
            Chartist.plugins.fillDonut({
                items: [{
					content: label,
					position: 'center'
				}]
            })
        ],
	};
	return retour;
}
function setSliceAnimation(data){
	var pathLength = data.element._node.getTotalLength();

	data.element.attr({
	  'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
	});

	var animationDefinition = {
		'stroke-dashoffset': {
		id: 'anim' + data.index,
		begin : 500,
		dur: 3000,
		from: -pathLength + 'px',
		to:  '0px',
		easing: Chartist.Svg.Easing.easeOutQuint,
		fill: 'freeze'
		}
	};

	data.element.attr({
		'stroke-dashoffset': -pathLength + 'px'
	});

	data.element.animate(animationDefinition, false);
}

function generateParcDonutCars(donnee, type){

	carDestroyAnimation(type);
	var newNbCar = Math.round(donnee/2);

	var places = getRandomPlace(type, newNbCar);

	var parkzone = $("#cars"+type);
	
	for(var i=0; i<places.length; i++){
		var place = places[i.toString()];
		parkzone.append('<div class="car" id="car'+place.colonne+place.place+'"><img src="images/voitures.svg" alt="voiture"/></div>');
		var car = $('#car'+place.colonne+place.place);
		var hauteurApparition =((Math.random() * 10)+5);
		car.css('top', (place.top-hauteurApparition).toString()+"vh").css('left',(place.left).toString()+"vw");
		car.css("z-index",30+place.place).css("opacity", 0);
		carSpawnAnimation(car,place);
		car.removeAttr("id");
	}
	generateDonut(donnee, type);
}

function getRandomPlace(type, nb){
	//console.log(carPos);
	var nbCol = carPos[type].col.length;
	var retour = [];

	if(!nbMaxPlaces){
		nbMaxPlaces = 0;
		for(var i=0; i<nbCol; i++){
			nbMaxPlaces += carPos[type].col[i].nbPlace;
		}
	}
	
	//	console.log("########"+type);
	//	console.log("Nb col : "+carPos[type].col.length);
		for(var z=0; z<carPos[type].col.length; z++){
			
		//	console.log("Col "+z+" "+carPos[type].col[z].nbPlace+" places");
		}
		
	if(!allPlaces[type]){
		allPlaces[type] = [];
		for(i=0; i<nbCol; i++){
			for(var j=0; j<carPos[type].col[i].nbPlace; j++){
				allPlaces[type].push({
					colonne : i,
					place : j
				});
			}
		}
	}
	
	var copieAllPlaces = allPlaces[type].slice();
	if(nbMaxPlaces > nb){
		for(i=0; i<nb; i++){
			var randPlaceIndex = Math.round((Math.random() * (copieAllPlaces.length-1)));
			var place = copieAllPlaces.splice(randPlaceIndex,1)[0];
			place.top = carPos[type].col[place.colonne].origine.top + (carPos[type].deltaNextPos.top * place.place);
			place.left = carPos[type].col[place.colonne].origine.left + (carPos[type].deltaNextPos.left * place.place);
			retour.push(place);
		}
	}
	return retour;
}

function removeAllCars(){
	$("#carsoccasion, #carsneuf").children().remove();
}

function carDestroyAnimation(type){
	var car = $("#cars"+type).children();
	car.stop().animate({
		opacity : 0
	}, 800, car.remove);
}

function carSpawnAnimation(car,place){
	var duration = Math.random()*500+1250;
	
	car.stop().animate({
		top : (place.top).toString()+"vh"
	},{
		duration : duration,
		easing : "easeOutBounce",
		queue : false
	}).animate({
		opacity : 1
	}, duration);
}


function generateBarChart(serie){
	var donnees ={
		labels : ["Diesel", "Essence", "Bicarburant", "Electrique", "Hybride", "Gaz", "Superéthanol"],
		series :[[serie.diesel.pourcentage,serie.essence.pourcentage,serie.bicarburant.pourcentage,serie.electricite.pourcentage, serie.hybride.pourcentage, serie.gaz.pourcentage, serie.superethanol.pourcentage]]

	};
	var chart = new Chartist.Bar('#barchart',
	donnees,
	{
		axisX:{
			showGrid: false,
			showLabel: false
		},
		axisY:{
			showLabel: true,
			showGrid: false,
			offset:100
		},
		horizontalBars: true,
			chartPadding: {
		    top: 15,
		    right: 35,
		    bottom: 5,
		    left: 10
  		}

	});

	chart.on('draw', function(param){
		if(param.type === 'bar'){

			var valeur = $("#barchart svg");

			valeur.appendSvg('text', {
				id : param.axisY.ticks[param.index],
				x : param.x2 + 1,
				y : param.y2 + 5,
				class : "ct-label",
				opacity : 0,
			}, Math.round(param.value.x * 10)/10+'%');

			var label = $('#'+param.axisY.ticks[param.index]);

			label.delay(1000).animate({
				opacity : 1,
			},500);

			param.element.animate({
				x2: {
					begin: 0,
					dur: 1000,
					from: param.x1,
					to: param.x2,
					easing: 'easeOutQuart'
				}
			});
		}
	});
}

function animateStop(className){
	$(className).stop();
}
function animateImage(className){
	var obj = $(className);
	animateTop(obj, 4000, 1);
	obj.dequeue("top");
	animateSize(obj, 2000, 1);
	obj.dequeue("size");
	animateLeft(obj, 4500, 2);
	obj.dequeue("left");
}

function animateCloud(className){
	var obj = $(className);
	animateTop(obj, 2000, 1);
	obj.dequeue("top");
	animateSize(obj, 3000, 2.5);
	obj.dequeue("size");
	animateLeft(obj, 2500, 2);
	obj.dequeue("left");
}
function animateSize(obj, duration_factor, random_factor){

	obj.each(function(){

		var seed = getPartiallyRandomSeed(random_factor);
		var duration = getPartiallyRandomDuration(duration_factor);

		$(this).animate({
			width : seed[0]+"vw"
		},{
			queue : "size",
			duration : duration,
			easing : "easeInOutSine"
		}).animate({
			width : seed[1]+"vw"
		},{
			queue : "size",
			duration : duration,
			easing : "easeInOutSine",
			done: animateSize.bind(undefined, obj, duration_factor, random_factor)
		});
	});
}

function animateTop(obj, duration_factor, random_factor){

	obj.each(function(){

		var seed = getPartiallyRandomSeed(random_factor);
		var duration = getPartiallyRandomDuration(duration_factor);

		$(this).animate({
			top : seed[0]+"vh"
		},{
			queue : "top",
			duration : duration,
			easing : "easeInOutSine"
		}).animate({
			top : seed[1]+"vh"
		},{
			queue : "top",
			duration : duration,
			easing : "easeInOutSine",
			done: animateTop.bind(undefined, obj, duration_factor, random_factor)
		});
	});
}

function animateLeft(obj, duration_factor, random_factor){

	obj.each(function(){

		var seed = getPartiallyRandomSeed(random_factor);
		var duration = getPartiallyRandomDuration(duration_factor);

		$(this).animate({
			left : seed[0]+"vw"
		},{
			queue : "left",
			duration : duration,
			easing : "easeInOutSine"
		}).animate({
			left : seed[1]+"vw"
		},{
			queue : "left",
			duration : duration,
			easing : "easeInOutSine",
			done: animateLeft.bind(undefined, obj, duration_factor, random_factor)
		});
	});
}

function getPartiallyRandomDuration(duration){
	return Math.round((Math.random()-0.5)*duration/2+duration);
}

function getPartiallyRandomSeed(random){
	var retour = [];

	var seed = Math.abs((Math.random()-0.5)*random*2);

	if(seed > 0){
		retour[0] = "+="+seed;
		retour[1] = "-="+seed;
	}else{
		retour[0] = "-="+seed;
		retour[1] = "+="+seed;
	}
	return retour;
}
jQuery.fn.extend({
    appendSvg:function (nom,attributs,text)
              {
                  var newSvgNode = document.createElementNS("http://www.w3.org/2000/svg",nom);
                  for (var attr in attributs)
                  {
                          var valeur = attributs[attr];
                          newSvgNode.setAttribute(attr,valeur);
                  }
                  var size = this.length;
                  for (var i = 0; i < size; i++)
                  {
                          this[i].appendChild(newSvgNode);
                  }
                  newSvgNode.appendChild(document.createTextNode(text));
                  return newSvgNode;
              }
});

function counterSoldCars(){
	var counter = 0;
	$("#carCounter").html("Depuis votre arrivée sur cette page, aucune voiture n'a été vendue.");
	setInterval(function(){
		if(counter < 0) counter = 0;
		counter++;
		if(counter > 1) $("#carCounter").html("Depuis votre arrivée sur cette page, "+counter+" voitures ont été vendues.");
		else if(counter == 1) $("#carCounter").html("Depuis votre arrivée sur cette page, une voiture a été vendue.");

	},4200);
}

function animateMethodo(){
	$("#methodo").click(function(){
		if($(this).attr("statut") == "small"){

			$(this).attr("statut", "big");
			$(this).animate({
				height : "80vh",
				width : "60vw",
				left : "20vw"
			},1000).animate({
				opacity : 1
			}, 500, function(){
				$("#textMethodo").css("display", "block");
			});

			$("#textMethodo").delay(1500).animate({
				opacity : 1
			},1000);
		}
		else{
			$(this).attr("statut", "small");

			$("#textMethodo").animate({
				opacity : 0
			},1000, function(){
				$(this).css("display", "none");
			});

			$(this).delay(1000).animate({
				opacity : 0.6
			},500).animate({
				height : "5ch",
				width : "10vw",
				left: "75vw"
			},1000);


		}
	});
}


var data={
    "menage": {
        "years": [
            "1990",
            "2000",
            "2006",
            "2007",
            "2008",
            "2009",
            "2010",
            "2011",
            "2012",
            "2013",
            "2014"
        ],
        "categorie": "menage",
        "dataType": [
            "mono",
            "biPlus",
            "none",
            "detention"
        ],
        "yearsComments": {
            "1990": "<h4>1990</h4></br>En 1990, 76,8% des ménages sont équipés d’au moins une voiture. La tendance est aux ménages mono-motorisés (50,5%), tandis les ménages bi-motorisés ou plus sont minoritaires (26,3%). La part des ménages non-motorisés s’élève à 23,2%.",
            "2000": "<h4>2000</h4></br>La part des ménages motorisés augmente légèrement, en raison notamment des aides de l’Etat mises en place dans les années 90 pour acquérir un véhicule. La part de ménages bi-motorisés ou plus augmente, passant de 26,3% à 29,6%. La part des ménages non-motorisés diminue, baissant de 23,2% à 19,7%.",
            "2006": "",
            "2007": "",
            "2008": "",
            "2009": "",
            "2010": "<h4>2010</h4></br>La part des ménages motorisés continue d’augmenter, passant de 80,3% à 83,5%. Les ménages disposent de plus en plus d’une seconde voiture : la part des bi-motorisés ou plus grimpe de 29,6% à 35,9%.",
            "2011": "",
            "2012": "",
            "2013": "",
            "2014": "<h4>2014</h4></br>Pour la première fois, la part des ménages motorisés recule, passant de 83,5% à 82,8%. La part des ménages mono-motorisés remonte, passant de 47,6% à 48,8%."
        },
        "yearsToScreen": [
            "1990",
            "2000",
            "2010",
            "2014"
        ],
        "data": {
            "1990": {
                "mono": {
                    "val": null,
                    "pourcentage": 50.5
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 26.3
                },
                "none": {
                    "val": null,
                    "pourcentage": 23.2
                },
                "detention": {
                    "val": 3.7,
                    "pourcentage": null
                }
            },
            "2000": {
                "mono": {
                    "val": null,
                    "pourcentage": 50.7
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 29.6
                },
                "none": {
                    "val": null,
                    "pourcentage": 19.7
                },
                "detention": {
                    "val": 4.4,
                    "pourcentage": null
                }
            },
            "2006": {
                "mono": {
                    "val": null,
                    "pourcentage": 46.3
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.7
                },
                "none": {
                    "val": null,
                    "pourcentage": 18
                },
                "detention": {
                    "val": 4.9,
                    "pourcentage": null
                }
            },
            "2007": {
                "mono": {
                    "val": null,
                    "pourcentage": 46.6
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.8
                },
                "none": {
                    "val": null,
                    "pourcentage": 17.6
                },
                "detention": {
                    "val": 4.9,
                    "pourcentage": null
                }
            },
            "2008": {
                "mono": {
                    "val": null,
                    "pourcentage": 46.9
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.8
                },
                "none": {
                    "val": null,
                    "pourcentage": 17.3
                },
                "detention": {
                    "val": 4.9,
                    "pourcentage": null
                }
            },
            "2009": {
                "mono": {
                    "val": null,
                    "pourcentage": 47.5
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.7
                },
                "none": {
                    "val": null,
                    "pourcentage": 16.8
                },
                "detention": {
                    "val": 4.9,
                    "pourcentage": null
                }
            },
            "2010": {
                "mono": {
                    "val": null,
                    "pourcentage": 47.6
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.9
                },
                "none": {
                    "val": null,
                    "pourcentage": 16.5
                },
                "detention": {
                    "val": 5,
                    "pourcentage": null
                }
            },
            "2011": {
                "mono": {
                    "val": null,
                    "pourcentage": 48.2
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.3
                },
                "none": {
                    "val": null,
                    "pourcentage": 16.5
                },
                "detention": {
                    "val": 5.1,
                    "pourcentage": null
                }
            },
            "2012": {
                "mono": {
                    "val": null,
                    "pourcentage": 48.1
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 35.2
                },
                "none": {
                    "val": null,
                    "pourcentage": 16.7
                },
                "detention": {
                    "val": 5.2,
                    "pourcentage": null
                }
            },
            "2013": {
                "mono": {
                    "val": null,
                    "pourcentage": 48.3
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 34.9
                },
                "none": {
                    "val": null,
                    "pourcentage": 16.9
                },
                "detention": {
                    "val": 5.3,
                    "pourcentage": null
                }
            },
            "2014": {
                "mono": {
                    "val": null,
                    "pourcentage": 48.8
                },
                "biPlus": {
                    "val": null,
                    "pourcentage": 34
                },
                "none": {
                    "val": null,
                    "pourcentage": 17.2
                },
                "detention": {
                    "val": 5.4,
                    "pourcentage": null
                }
            }
        }
    },
    "parc": {
        "years": [
            "1990",
            "2000",
            "2006",
            "2007",
            "2008",
            "2009",
            "2010",
            "2011",
            "2012",
            "2013",
            "2014"
        ],
        "categorie": "parc",
        "dataType": [
            "neuf",
            "occasion"
        ],
        "yearsComments": {
            "1990": "<h4>1990</h4></br>En 1990, le marché de l’occasion représente la moitié des voitures particulières vendues en France.  La durée moyenne de détention d’un véhicule par ménage est de 3,7 ans.",
            "2000": "<h4>2000</h4></br>Le marché des véhicules d’occasion connait une croissance soutenue avec une progression de 6,1% en 10 ans qui coïncide avec la durée de détention du véhicule qui passe à 4,4 ans. ",
            "2006": "",
            "2007": "",
            "2008": "",
            "2009": "",
            "2010": "<h4>2010</h4></br>En 2010, le marché de l’occasion s’élargit car les modèles gagnent en durabilité grâce à une meilleure qualité des voitures. La situation économique explique également ce succès, les consommateurs cherchent des produits moins coûteux.",
            "2011": "",
            "2012": "",
            "2013": "",
            "2014": "<h4>2014</h4></br>Légère baisse du marché notamment due à l’augmentation des prix des véhicules d’occasion en 2014, l'offre étant plus étroite, ce qui a conduit à une hausse des prix. La durée moyenne de détention du véhicule passe à 5,4 ans."
        },
        "yearsToScreen": [
            "1990",
            "2000",
            "2010",
            "2014"
        ],
        "data": {
            "1990": {
                "neuf": {
                    "val": null,
                    "pourcentage": 50
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 50
                }
            },
            "2000": {
                "neuf": {
                    "val": null,
                    "pourcentage": 43.9
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 56.1
                }
            },
            "2006": {
                "neuf": {
                    "val": null,
                    "pourcentage": 39.2
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 60.8
                }
            },
            "2007": {
                "neuf": {
                    "val": null,
                    "pourcentage": 38.1
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 61.9
                }
            },
            "2008": {
                "neuf": {
                    "val": null,
                    "pourcentage": 38.1
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 61.9
                }
            },
            "2009": {
                "neuf": {
                    "val": null,
                    "pourcentage": 40.4
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 59.6
                }
            },
            "2010": {
                "neuf": {
                    "val": null,
                    "pourcentage": 41.1
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 58.9
                }
            },
            "2011": {
                "neuf": {
                    "val": null,
                    "pourcentage": 42.2
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 57.8
                }
            },
            "2012": {
                "neuf": {
                    "val": null,
                    "pourcentage": 42.1
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 57.9
                }
            },
            "2013": {
                "neuf": {
                    "val": null,
                    "pourcentage": 41
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 59
                }
            },
            "2014": {
                "neuf": {
                    "val": null,
                    "pourcentage": 41.5
                },
                "occasion": {
                    "val": null,
                    "pourcentage": 58.5
                }
            }
        }
    },
    "carburant": {
        "years": [
            "2009",
            "2010",
            "2011",
            "2012",
            "2013",
            "2014"
        ],
        "categorie": "carburant",
        "dataType": [
            "diesel",
            "essence",
            "bicarburant",
            "electricite",
            "hybride",
            "gaz",
            "superethanol"
        ],
        "yearsComments": {
            "2009": "<h4>2009</h4></br>Le diesel est déjà le carburant préféré des Français : moins cher à la consommation et moins energivore, il est la boisson de 1 635 542 véhicules en France. L’essence n’est pas en reste, mais tous les autres types d’énergies sont à la peine. L’électricité et le gaz sont quasi inexistants, et les voitures hybrides ou bicarburant ne représentent qu’à peine 1% du parc français.",
            "2010": "<h4>2010</h4></br>Les nouvelles énergies tentent une percée : elles passent de 1.5 % du parc automobile français à 4 %, soit 50 000 voitures de plus qui roulent écolo. La préférence va au bicarburant électricité + essence qui concerne 75 568 unités sur plus de deux millions véhicules.",
            "2011": "<h4>2011</h4></br>Les nouvelles énergies retombent comme un soufflé : elles passent de 4 % à 1,3 %. Le bicarburant est complètement délaissé au profit du tout électrique qui commence à se faire connaître et évoluera doucement jusqu’à ce jour. Indétrônable, le diesel gagne 2 points de plus.",
            "2012": "<h4>2012</h4></br>L’électrique poursuit lentement sa percée avec 5.663 français convaincus tandis que l’hybride triple ses ventes avec presque 30 000 véhicules, encouragé par des aides incitatives de l’Etat. Le superhétanol est à son apogée en 4 ans, en atteignant... 0.4 % du parc automobile. Par la suite, il va chuter fortement.",
            "2013": "<h4>2013</h4></br>2013, année du changement : le diesel est en berne. De plus en plus accusé de polluer, et de moins en moins compétitif, il perd 6 % du marché. L’essence en profite pour atteindre 29 % du parc automobile. Le superhétanol, lui, n’est plus qu’un lointain souvenir avec 240 voitures concernées sur quasiment 1,8 million d’autos.",
            "2014": "<h4>2014</h4></br>La tendance se confirme : l’énergie diesel est toujours plus délaissée (64 %) au profit de l’essence (33 %), de l’hybride et de l’électricité."
        },
        "yearsToScreen": [
            "2009",
            "2010",
            "2011",
            "2012",
            "2013",
            "2014"
        ],
        "data": {
            "2009": {
                "diesel": {
                    "val": 1628495,
                    "pourcentage": 70.73075496463235
                },
                "essence": {
                    "val": 635542,
                    "pourcentage": 27.60362510890876
                },
                "bicarburant": {
                    "val": 25166,
                    "pourcentage": 1.0930400028492182
                },
                "electricite": {
                    "val": 12,
                    "pourcentage": 0.0005211984437014471
                },
                "hybride": {
                    "val": 9873,
                    "pourcentage": 0.4288160195553656
                },
                "gaz": {
                    "val": 48,
                    "pourcentage": 0.0020847937748057883
                },
                "superethanol": {
                    "val": 3250,
                    "pourcentage": 0.14115791183580859
                }
            },
            "2010": {
                "diesel": {
                    "val": 1593173,
                    "pourcentage": 70.75536136830361
                },
                "essence": {
                    "val": 567857,
                    "pourcentage": 25.219437713619797
                },
                "bicarburant": {
                    "val": 75710,
                    "pourcentage": 3.3624022056576823
                },
                "electricite": {
                    "val": 184,
                    "pourcentage": 0.00817173432625827
                },
                "hybride": {
                    "val": 9655,
                    "pourcentage": 0.428793994130563
                },
                "gaz": {
                    "val": 37,
                    "pourcentage": 0.0016432291851714996
                },
                "superethanol": {
                    "val": 5048,
                    "pourcentage": 0.22418975477691166
                }
            },
            "2011": {
                "diesel": {
                    "val": 1595803,
                    "pourcentage": 72.39848216627031
                },
                "essence": {
                    "val": 573520,
                    "pourcentage": 26.01948830275375
                },
                "bicarburant": {
                    "val": 12020,
                    "pourcentage": 0.5453240504238738
                },
                "electricite": {
                    "val": 2630,
                    "pourcentage": 0.11931799106612213
                },
                "hybride": {
                    "val": 13641,
                    "pourcentage": 0.6188656715334494
                },
                "gaz": {
                    "val": 24,
                    "pourcentage": 0.0010888333785501639
                },
                "superethanol": {
                    "val": 6556,
                    "pourcentage": 0.2974329845739531
                }
            },
            "2012": {
                "diesel": {
                    "val": 1383313,
                    "pourcentage": 72.8536857045801
                },
                "essence": {
                    "val": 471255,
                    "pourcentage": 24.81915781656928
                },
                "bicarburant": {
                    "val": 2052,
                    "pourcentage": 0.10807081482339745
                },
                "electricite": {
                    "val": 5663,
                    "pourcentage": 0.2982480625462474
                },
                "hybride": {
                    "val": 29120,
                    "pourcentage": 1.5336365144528914
                },
                "gaz": {
                    "val": 11,
                    "pourcentage": 0.0005793269800474522
                },
                "superethanol": {
                    "val": 7341,
                    "pourcentage": 0.38662176004803145
                }
            },
            "2013": {
                "diesel": {
                    "val": 1199689,
                    "pourcentage": 67.00484961610232
                },
                "essence": {
                    "val": 532109,
                    "pourcentage": 29.719271848266164
                },
                "bicarburant": {
                    "val": 2834,
                    "pourcentage": 0.15828414181678246
                },
                "electricite": {
                    "val": 8779,
                    "pourcentage": 0.4903233877944719
                },
                "hybride": {
                    "val": 46785,
                    "pourcentage": 2.6130287843677378
                },
                "gaz": {
                    "val": 15,
                    "pourcentage": 0.0008377777442666681
                },
                "superethanol": {
                    "val": 240,
                    "pourcentage": 0.01340444390826669
                }
            },
            "2014": {
                "diesel": {
                    "val": 1146658,
                    "pourcentage": 63.84986407671842
                },
                "essence": {
                    "val": 592927,
                    "pourcentage": 33.01621613193858
                },
                "bicarburant": {
                    "val": 2296,
                    "pourcentage": 0.12784918251139005
                },
                "electricite": {
                    "val": 10561,
                    "pourcentage": 0.588072829487278
                },
                "hybride": {
                    "val": 43143,
                    "pourcentage": 2.4023507321815774
                },
                "gaz": {
                    "val": 27,
                    "pourcentage": 0.001503452930229761
                },
                "superethanol": {
                    "val": 254,
                    "pourcentage": 0.014143594232531826
                }
            }
        }
    }
}
