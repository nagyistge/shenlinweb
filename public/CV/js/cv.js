/**
 * Created by Daniel on 3/12/16.
 */
new Vue ({
    el: '#intro',

    data: {
        avatarSrc: '',
        name: 'SHEN Lin',
        description: 'The most amazing thing of programming is the feeling to create and destruct',
        email: 'shenlin192@gmail.com'
    },

    ready: function() {
        $('#fullpage').fullpage({
            //Navigation
            menu: '#menu',
            lockAnchors: false,
            anchors:['Welcome', 'Skill', 'Experience', 'Education', 'Other'],
            navigation: true,
            navigationPosition: 'left',
            navigationTooltips: ['welcome', 'skills', 'experiences', 'education', 'others'],
            showActiveTooltip: true,
            slidesNavigation: true,
            slidesNavPosition: 'bottom',

            //Scrolling
            css3: true,
            scrollingSpeed: 700,
            autoScrolling: true,
            fitToSection: true,
            fitToSectionDelay: 1000,
            scrollBar: false,
            easing: 'easeInOutCubic',
            easingcss3: 'ease',
            loopBottom: true,
            loopTop: false,
            loopHorizontal: true,
            continuousVertical: false,
            normalScrollElements: '#element1, .element2',
            scrollOverflow: false,
            touchSensitivity: 15,
            normalScrollElementTouchThreshold: 5,

            //Accessibility
            keyboardScrolling: true,
            animateAnchor: true,
            recordHistory: true,

            //Design
            controlArrows: true,
            verticalCentered: true,
            resize : false,
            paddingTop: '3em',
            paddingBottom: '10px',
            fixedElements: '#header, .footer',
            responsiveWidth: 0,
            responsiveHeight: 0,

            //Custom selectors
            sectionSelector: '.section',
            slideSelector: '.slide'
        });
    }
});

new Vue({
    el: '#skills',

    data: {
    	title:'skills',
    	
        chart: null,

        chartHeight: 400,
        shouldOffset: false,

        curTab: null,

        tabs: {
            frontend:  ['frontend'],
            backend:   ['backend'],
            language:  ['language'],
            tool:      ['tool'],
            framework: ['framework'],
            database:  ['database'],
            IDE:       ['IDE'],
            dataviz:   ['dataviz']
        },

        skills: [
            { name: 'JavaScript',    level: 8, tag: ['frontend', 'language'] },        
            { name: 'HTML(5)',          level: 7, tag: ['frontend', 'language'] },
            { name: 'CSS(3)',           level: 7, tag: ['frontend', 'language'] },
            { name: 'Matlab',        level: 6, tag: ['language'] },
            { name: 'C++',           level: 4, tag: ['backend', 'language'] },
     
			{ name: 'VueJs',        level: 6, tag: ['frontend', 'framework'] },
            { name: 'jQuery',        level: 8, tag: ['frontend', 'framework'] },
            { name: 'AngularJS2',     level: 4, tag: ['frontend', 'framework'] },
            { name: 'Bootstrap',     level: 6, tag: ['frontend', 'framework'] },
            { name: 'D3.js',         level: 4, tag: ['frontend', 'framework', 'dataviz'] },
            { name: 'Highcharts',    level: 4, tag: ['frontend', 'framework', 'dataviz'] },
            { name: 'SVG',    level: 5, tag: ['frontend', 'framework', 'dataviz'] },

            { name: 'Node.js',       level: 4, tag: ['backend', 'framework'] },
         

            { name: 'MySQL',         level: 6, tag: ['backend', 'database'] },
            { name: 'Navicat',         level: 5, tag: ['tool', 'database'] },

            { name: 'Gulp',         level: 3, tag: ['frontend', 'tool'] },
            { name: 'npm',           level: 6, tag: ['frontend', 'backend', 'tool'] },
            { name: 'Git',           level: 7, tag: ['tool'] },

            { name: 'WebStorm',      level: 8, tag: ['IDE'] },
            { name: 'Visual Studio', level: 5, tag: ['IDE'] },
            { name: 'Vim',           level: 3, tag: ['IDE'] }
        ],

        switchButtons: [
            { english: 'frontend', chinese: '前端技能' },
            { english: 'backend', chinese: '后端技能' },
            { english: 'language', chinese: '编程语言' },
            { english: 'database', chinese: '数据库' },
            { english: 'tool', chinese: '开发工具' }
        ]
    },

    watch: {
    },

    methods: {
        switch: function (tab, event) {
            this.curTab = tab;
            console.log(this.curTab);
            console.log($(event.target));
            $(event.target).blur();
        }
    },

    //initialize the skill part
    ready: function () {
        var self = this;

        self.shouldOffset = window.innerWidth <= 450;

        $(window).resize(function () {
            self.shouldOffset = window.innerWidth <= 450;
            var filtered = self.skills
                .filter(function (skill) {
                    return skill.tag.indexOf(self.curTab) !== -1;
                });
            if (window.innerWidth <= 768) {
                if (filtered.length < 5) {
                    self.chart.setSize(window.innerWidth * 0.9, window.innerHeight * 0.3, true);
                }
                else if (filtered.length < 8) {
                    self.chart.setSize(window.innerWidth * 0.9, window.innerHeight * 0.4, true);
                }
                else {
                    self.chart.setSize(window.innerWidth * 0.9, window.innerHeight * 0.6, true);
                }
            }
            else {
                self.shouldOffset = false;
                if (filtered.length < 5) {
                    self.chart.setSize(500, window.innerHeight * 0.3, true);
                }
                else if (filtered.length < 8) {
                    self.chart.setSize(500, window.innerHeight * 0.4, true);
                }
                else {
                    self.chart.setSize(500, window.innerHeight * 0.6, true);
                }
            }
        });

        self.$watch('curTab', function (val) {
            var filtered = self.skills
                .filter(function (skill) {
                    return skill.tag.indexOf(val) !== -1;
                })
                .sort(function (a, b) {
                    return b.level - a.level;
                });

            var cat = [], data = [], max = [];

            filtered.forEach(function (skill) {
                cat.push(skill.name);
                data.push(skill.level);
                max.push(10);
            });

            self.chart.xAxis[0].update({
                categories: cat
            }, false);
            self.chart.series[0].update({
                data: max
            }, false);
            self.chart.series[1].update({
                data: data
            }, false);
            self.chart.redraw();

            if (window.innerWidth > 768) {
                if (filtered.length < 5) {
                    self.chart.setSize(500, window.innerHeight * 0.3, true);
                }
                else if (filtered.length < 8) {
                    self.chart.setSize(500, window.innerHeight * 0.4, true);
                }
                else {
                    self.chart.setSize(500, window.innerHeight * 0.6, true);
                }
            }
            else {
                if (filtered.length < 5) {
                    self.chart.setSize(window.innerWidth * 0.9, window.innerHeight * 0.3, true);
                }
                else if (filtered.length < 8) {
                    self.chart.setSize(window.innerWidth * 0.9, window.innerHeight * 0.4, true);
                }
                else {
                    self.chart.setSize(window.innerWidth * 0.9, window.innerHeight * 0.6, true);
                }
            }
        });


        // Create the chart
        self.chart = new Highcharts.Chart('skillChart', {
            chart: {
                type: 'bar',
                backgroundColor: '#60BAE3',
                marginLeft: 80,
                width: 500,
                height: 400
            },
            title: {
                text: null
            },
            xAxis: {
                categories: [],
                title: {
                    text: null
                },
                tickWidth: 0,
                lineWidth: 0
            },
            yAxis: {
                min: 0,
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                },
                gridLineWidth: 0
            },
            tooltip: {
                enabled: false
            },
            plotOptions: {
                bar: {
                    grouping: false,
                    borderWidth: 1,
                    borderColor: '#DBF4FF',
                    pointWidth: 10,
                    pointRange: 10,
                    dataLabels: {
                        enabled: false
                    }
                },
                series: {
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    name: 'background',
                    data: [],
                    color: '#60BAE3',
                    borderRadius: 5
                },
                {
                    name: 'level',
                    data: [],
                    color: '#DBF4FF',
                    borderRadius: 5
                }
            ]
        });

        this.curTab = 'frontend';
    }
});


new Vue({
    el: '#experiences',

    data: {
        title:'Projects and Experiences',

        expArray: [
            {
                title: 'Polytech nantes',
                subject: 'Research and Development Project',
                duration: '2016.10 - Now',
                description: 'Develop a JavasScript interpreter for the C++ library DGtal'
            },
            {
                title: 'YiKai Network',
                subject: 'Front-end developer internship',
                duration: '2016.6 - 2016.9',
                description: 'Developed a platform to help people create their own web sites'
            },
            {
                title: 'South China University of Technology',
                subject: 'Research and Development Project',
                duration: '2014.03 - 2015.03',
                description: 'Proposed a new integrated neural network for fault detection'
            }
        ]
    }
});


new Vue({
    el: '#educations',

    data: {
        title:'Education',
        eduArray: [
            {
                school: 'Polytech Nantes',
                degree: 'Information engineer',
                duration: '2015.09 - now'
            },
            {
                school: 'South China University of Technology',
                degree: 'Automation Bachelor',
                duration: '2011.09 - 2015.07'
            }
        ]
    }
});
