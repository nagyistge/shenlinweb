/***************************A initialisation*************************/
$('document').ready(function(){
   $('.meta-field .protocol-group').hide();
   $('.meta-field .format-group').hide();

   $(".treatment-type-selector,.treatment-head-selector").select2({
        placeholder: "Select a state",
        minimumResultsForSearch: Infinity
    });

});

/****************************************************************/
/*************************B inter field set logic******************/
/****************************************************************/

/*******************Switch between fieldSets********************/
let currentFieldSet, nextFieldSet, previousFieldSet; //fieldsets
let left, opacity, scale; //fieldset properties which we will animate
let animating; //flag to prevent quick multi-click glitches


$(".next").click(function(){
    if(animating) return false;
    animating = true;

    currentFieldSet = $(this).parent();
    nextFieldSet = $(this).parent().next();

    //activate next step on progressbar using the index of nextFieldSet
    $("#progressbar li").eq($("fieldset").index(nextFieldSet)).addClass("active");

    //show the next fieldset
    nextFieldSet.show();
    //hide the current fieldset with style
    currentFieldSet.animate({opacity: 0}, {
        step: function(now, mx) {
            scale = 1 - (1 - now) * 0.2;
            left = (now * 50)+"%";
            opacity = 1 - now;
            currentFieldSet.css({'transform': 'scale('+scale+')'});
            nextFieldSet.css({'left': left, 'opacity': opacity});
        },
        duration: 800,
        complete: function(){
            currentFieldSet.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});

$(".previous").click(function(){
    if(animating) return false;
    animating = true;

    currentFieldSet = $(this).parent();
    previousFieldSet = $(this).parent().prev();

    //de-activate current step on progressbar
    $("#progressbar li").eq($("fieldset").index(currentFieldSet)).removeClass("active");

    //show the previous fieldset
    previousFieldSet.show();
    //hide the current fieldset with style
    currentFieldSet.animate({opacity: 0}, {
        step: function(now, mx) {
            //as the opacity of currentFieldSet reduces to 0 - stored in "now"
            //1. scale previousFieldSet from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take currentFieldSet to the right(50%) - from 0%
            left = ((1-now) * 50)+"%";
            //3. increase opacity of previousFieldSet to 1 as it moves in
            opacity = 1 - now;
            currentFieldSet.css({'left': left});
            previousFieldSet.css({'transform': 'scale('+scale+')', 'opacity': opacity});
        },
        duration: 800,
        complete: function(){
            currentFieldSet.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});


/****************************************************************/
/********************C inner field set logic***********************/
/******************************************************************/

/***************************1 Meta field set***********************/

let formatName = "JSON";
let protocolMode = "HTTP";

//expand and collapse format
$('fieldset:first').find('input[name=protocol]').on('click',function(){
    $('.protocol-group').slideToggle();
});

//expand and collapse protocol
$('fieldset:first').find('input[name=format]').on('click',function(){
    $('.format-group').slideToggle();
    if(formatName=="JSON"){
        $('.format-group').find('input.csv').hide();
    }else{
        $('.format-group').find('input.csv').show();
    }
});


//select format name
$('#format-name').select2({
    minimumResultsForSearch: Infinity
}).on('select2:select',function(){
    formatName = $(this).val();
    if(formatName=="JSON"){
        $('.format-group').find('input.csv').hide('slow');
        //change the treatment location type
        console.log('JSON');
        $('fieldset:last').find('input[name=location]').each(function() {
            $("<input type='text' />").attr({ name: this.name, value: this.value, min:0 }).insertBefore(this);
            $(this).remove();
        });
    }else{
        $('.format-group').find('input.csv').show('slow');
        console.log('CSV');
        //change the treatment location type
        $('fieldset:last').find('input[name=location]').each(function() {
            $("<input type='number' />").attr({ name: this.name, value: this.value, min:0 }).insertBefore(this);
            $(this).remove();
        });
    }
});


//select protocol mode
$('#protocol-mode').select2({
    minimumResultsForSearch: Infinity
}).on('select2:select',function(){
    protocolMode = $(this).val();
    if(protocolMode=="HOSTED"){
        $('.protocol-group').find('input.host').prop('disabled', true).val(' ');

    }else{
        $('.protocol-group').find('input.host').prop('disabled', false).val('');
    }
});


/***************************2 Config Type field set***************/
let configType = 'Contacts';

$("#config-type-selector").select2({
    placeholder: "Select a state",
    minimumResultsForSearch: Infinity,
}).on('select2:select', function (evt){

    if($(this).val()=='Products' && configType == "Contacts" ){
        //change from Contact to Product
        console.log('Products');
        configType='Products';
        $('fieldset').last().find('.select-group.head').empty().append(`
                <span class="select-tips">chose a header</span>
                <select class="treatment-head-selector" style="width:100%">
                    <option>name</option> 
                    <option>description</option>  
                    <option>image</option>  
                    <option>price</option>  
                    <option>currency</option>  
                    <option>source</option> 
                    <option>web_link</option>   
                </select>
            `)
    }
    else if($(this).val()=='Contacts' && configType == "Products"){

        //change from Product to Contact
        configType='Contacts';
        console.log('Contacts');
        $('fieldset').last().find('.select-group.head').empty()
            .append(`
                <span class="select-tips">chose a header</span>
                <select class="treatment-head-selector" style="width:100%">
                    <option>firstname</option>
                    <option>lastname</option>
                    <option>address</option>
                    <option>mail</option>
                    <option>country</option>
                    <option>city</option>
                    <option>postal</option>
                    <option>birthdate</option>
                    <option>source</option>
                    <option>incrption_date</option>
                </select>
            `)
    }

    // refresh selector in treatment
    $(".treatment-type-selector,.treatment-head-selector").select2({
        placeholder: "Select a state",
        minimumResultsForSearch: Infinity
    })


});

/***************************3 Config treatment field set***************/

//add and remove treatments

$('fieldset').last().data('treatmentNum',1); // markdown the number of treatments


//add a treatment
$('.add').click(function () {

    let num = $(this).parent().data('treatmentNum');
    num++;

    $(this).parent().data('treatmentNum',num);

    let locationType = "text";

    if(formatName == "CSV"){
        locationType = "number";
    }else{
        locationType = "text";
    }

    //chose a treatment template
    if(configType=='Contacts') {
        $(this).parent().children('div:last').after(`
        <div id='treatment' class="treatment-group">
			  <span class="delete">X</span>
            <div class="select-group head">
                <span class="select-tips">chose a header</span>
                <select class="treatment-head-selector"  style="width:100%">
                    <option>firstname</option>
                    <option>lastname</option>
                    <option>address</option>
                    <option>mail</option>
                    <option>country</option>
                    <option>city</option>
                    <option>postal</option>
                    <option>birthdate</option>
                    <option>source</option>
                    <option>incrption_date</option>
                </select>
            </div>

            <div class="select-group">
                <span class="select-tips type">chose a type</span>
                <select class="treatment-type-selector" style="width: 100%">
                    <option>float</option>
                    <option>integer</option>
                    <option>string</option>
                    <option>date</option>
                </select>
            </div>
            <input type=${locationType} name="location" placeholder="location" />
		</div>
    `)
    }else{
       $(this).parent().children('div:last').after(`
        <div class="treatment-group">
			  <span class="delete">X</span>
            <div class="select-group head">
                <span class="select-tips">chose a header</span>
                <select class="treatment-head-selector"  style="width:100%">
                   <option>name</option>
                    <option>description</option>
                    <option>image</option>
                    <option>price</option>
                    <option>currency</option>
                    <option>source</option>
                    <option>web_link</option>
                </select>
            </div>

            <div class="select-group type">
                <span class="select-tips">chose a type</span>
                <select class="treatment-type-selector" style="width: 100%">
                    <option>float</option>
                    <option>integer</option>
                    <option>string</option>
                    <option>date</option>
                </select>
            </div>
            <input type=${locationType} name="location" placeholder="location" />
		</div>
    `)
    }

    //beautify newly created select elements
    $(this).siblings('div').last().find('.treatment-head-selector, .treatment-type-selector').select2({
            placeholder: "Select a state",
            minimumResultsForSearch: Infinity
    });

    //add animation to the creation of a treatment
    $(this).siblings('div').last().hide().slideDown(400, 'easeInOutBack');
});

// Delete a treatment
$('body').on('click','.delete',function () {

    let num = $(this).parent().parent().data('treatmentNum');
    num--;

    //make sure at least has one treatment
    if(num==0){
        swal({
            title: "Can not delete",
            text: "At least one treatment is required",
            type: "warning",
        });
        return false;
    }

    $(this).parent().parent().data('treatmentNum', num);

    //add animation to the remove of a treatment
    $(this).parent().animate({opacity: 0, height: 0, padding: 0, margin: 0}, {
        duration: 800,
        complete: function () {
            $(this).remove();
        },
        easing: 'easeInOutBack'
    });

});


/*******************************************************************/
/********************D submit field set logic***********************/
/*******************************************************************/
let result = {};

$('input.submit').on('click',function () {
    result = {};
    result['type'] = configType;
    result['treatment'] = [];

   // store meta inputs
    saveMetaValue();

    //store treatment inputs
    saveTreatmentValue();

    return false;

});

// save the input values of meta field set
function saveMetaValue() {

    //reset metaInfo
    result['meta']={};
    result['meta']['format'] = {};
    result['meta']['protocol'] = {};

    let metaFieldSet = $('fieldset:first');

    metaFieldSet.children('input[type=text]').each(function(){
        let key = $(this).attr('name');
        let val = $(this).val();
        if(val!='') {
            result['meta'][key] = val;
        }
    });

    //meta format data
    metaFieldSet.find('.format-group').children('input.format-input').each(function(){
        let key = $(this).attr('name');
        let val = $(this).val();
        if(val!='') {
            if($(this).attr('type')=='text') {
                result['meta']['format'][key] = val;
            }else if($(this).attr('type')=='number'){
                result['meta']['format'][key] = parseInt(val);
            }
        }
    });

    result['meta']['format']['name'] = formatName;
    if(formatName=='JSON'){
        delete result['meta']['format']['endline'];
        delete result['meta']['format']['separator'];
        delete result['meta']['format']['columns'];
    }

    //meta protocol data
    metaFieldSet.find('.protocol-group').children('input.protocol-input').each(function(){
        let key = $(this).attr('name');
        let val = $(this).val();

        if(val!='') {
            result['meta']['protocol'][key] = val;
        }
    });

    result['meta']['protocol']['mode'] = protocolMode;
    if(protocolMode=='HOSTED'){
        delete result['meta']['host'];
    }
}

// save input values of treatment field set
function saveTreatmentValue() {
    //empty the old values
    result['treatment'] = [];
    let treatmentFieldSet = $('fieldset:last');
    treatmentFieldSet.find('.treatment-group').each(function(){
        let location;

        if(formatName=="CSV"){
            location = parseInt($(this).find('input[name=location]').val());
        }else{
            location = $(this).find('input[name=location]').val();
        }

       let obj = {
           'head': $(this).find('.treatment-head-selector').val(),
           'type': $(this).find('.treatment-type-selector').val(),
           'location': location,
       };
       result['treatment'].push(obj);
    });

    let occurrence = false, falseColumnNum = false ;
    //check occurrence
    for(let i=0;i<result['treatment'].length;i++){
        let currentHead = result['treatment'][i]['head'];
        let currentLocation = result['treatment'][i]['location'];
        for(let j=i+1;j<result['treatment'].length;j++){
            if(currentHead==result['treatment'][j]['head']||currentLocation==result['treatment'][j]['location']){
                occurrence = true;
                break;
            }
        }
    }

    if(result['meta']['format']['name'] == 'CSV' && result['meta']['format']['columns']!= result['treatment'].length){
        falseColumnNum = true;
    }


    if(occurrence){
       swal({
          title: "Submit fail",
           text: "You have duplicate head or location",
           type: "warning",
       });

        result['treatment'] = [];
    }
    else if(falseColumnNum){
        swal({
            title: "Submit fail",
            text: "The column number defined in meta format doesn't correspond to the number of treatment",
            type: "warning",
        });
        result['treatment'] = [];
    }
    else{
        swal({
            title: "Your configuration is saved",
            type: "success",
           // timer: 2000,
           // showConfirmButton: false
        });
        console.log(result);
    }

}
