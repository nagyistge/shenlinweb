let free = $('#free');
let profession = $('#profession');
let enterprise = $('#enterprise');

//click on the "free" button of navigation bar 
$('#freeMenu').on('click', (e)=> {
    e.stopPropagation();
    if (free.css('backgroundColor') == "rgb(255, 255, 255)") {
        free.css("background-color", "wheat");
    } else {
        free.css("background-color", "white");
    }
    profession.css("background-color", "white");
    enterprise.css("background-color", "white");
});

//click on the "profession" button of navigation bar 
$('#professionMenu').on('click', (e)=> {
    e.stopPropagation();
    console.log(profession.css('backgroundColor'));
    if (profession.css('backgroundColor') == "rgb(255, 255, 255)") {
        profession.css("background-color", "wheat");
    } else {
        profession.css("background-color", "white");
    }
    free.css("background-color", "white");
    enterprise.css("background-color", "white");
});

//click on the "enterprise" button of navigation bar 
$('#enterpriseMenu').on('click', (e)=> {
    e.stopPropagation();
    if (enterprise.css('backgroundColor') == "rgb(255, 255, 255)") {
        enterprise.css("background-color", "wheat");
    } else {
        enterprise.css("background-color", "white");
    }
    free.css("background-color", "white");
    profession.css("background-color", "white");
});