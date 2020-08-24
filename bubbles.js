$('#bubbles-enter').waypoint(function () {

    var width = 1000,
        height = 600;

    var svg = d3.select("div#container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-50 50 1000 550")  //x-axis, y-axis, width, Height (changes svg-content)
        .classed("svg-content", true)

    var currentSliderDate = 1961;
    var selectedAnimal;
    var selectedAnimalBiomass;
    var summarizedData = new Array();
    var detailedData = new Array();
    var finishIntro = false;

    var biomassLabel = document.getElementById("biomass-label");
    biomassLabel.style.display = "none";
    var bubbleButtons = document.getElementById("bubble-buttons");
    bubbleButtons.style.display = "none";
    var tonneAmount = document.getElementById("tonne-amount");
    tonneAmount.style.display = "none";

    var radiusScale = d3.scaleSqrt().domain([3, 1200]).range([10, 54])  //Size Bubble-Chart

    //Split bubbles
    var forceXSeperate = d3.forceX(function (d) {
        if (d.Animal === 'Wild Animals') {
            return 150
        } else if(d.Animal === 'Humans') {
            return 340
        } else {
            return 720
        }
        return width / 2
    }).strength(0.05) //speed of split

    //Join bubbles
    //var forceXCombine = d3.forceX(width / 2).strength(0.05)

    var forceXCombine = d3.forceX(function (d) {
        if (d.Animal === 'Humans') {
            return 450
        }
        return width / 2
    }).strength(0.07) //speed of split


    //Distance between bubbles
    var forceCollide = d3.forceCollide(function (d) {
        return radiusScale(d[currentSliderDate]) + 1
    })

    //Initial bubbles
    var simulation = d3.forceSimulation()
        .force("x", forceXCombine)
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", forceCollide)

    d3.queue()
        .defer(d3.csv, "calculated_biomasses_in_100K_Tonnes_csv.csv")
        .await(ready);

    function ready(error, completeAnimalData) {

        createSpecificDataSets();
        function createSpecificDataSets() {
            var i;
            for (i = 0; i < completeAnimalData.length; i++) {

                //Create a array only with humans, Wild Animals and Farm Animal
                if(completeAnimalData[i].Animal === "Wild Animals" || completeAnimalData[i].Animal === "Farm Animals" || completeAnimalData[i].Animal === "Humans") {
                    summarizedData.push(completeAnimalData[i])
                }

                if(completeAnimalData[i].Animal !== "Farm Animals") {
                    detailedData.push(completeAnimalData[i])
                }
            }
        }

        //Slider
        var elem = document.querySelector('input[type="range"]');
        var rangeValue = function(){
            var sliderValue = elem.value;
            var target = document.querySelector('.value');
            target.innerHTML = sliderValue;
            circles
                .attr("r", function (d) {
                    currentSliderDate = sliderValue;
                    //Update Biomass of the current selected bubble, when move slider
                    if (d.Animal === selectedAnimal) {
                        document.getElementById("bubble-amount").innerHTML = Math.round(d[currentSliderDate]);
                    }
                    return radiusScale(d[currentSliderDate])
                })
            simulation.force("collide", forceCollide)
                .alphaTarget(0.5)
                .restart()

            if(finishIntro === true) {
            label
                .attr("font-size", function (d) {
                    return radiusScale(d[currentSliderDate] / 20)
                })
            }
        }
        elem.addEventListener("input", rangeValue);


        //Starts the automatic slider interval
        var sliderIterator
        setTimeout(startSliderIteration, 2000);
        function startSliderIteration() {
            sliderIterator = setInterval(iterateSlider, 160);
        }
        var yearTimer = 1961;
        function iterateSlider() {
            if(yearTimer === 2014) {
                clearInterval(sliderIterator);
                setTimeout(startSliderIteration, 1000);
                yearTimer = 1960
            }
            yearTimer += 1

            $('input[type="range"]').val(yearTimer);
            var target = document.querySelector('.value');
            target.innerHTML = yearTimer;
            rangeValue()
        }

        //Stops the autoamtic slider interval on different clickevents
        $(".value").click(function(){
            clearInterval(sliderIterator);
        });
        var onSliderTouch = document.querySelector('input[type="range"]');
        var stopInterval = function(){
            clearInterval(sliderIterator);
        }
        onSliderTouch.addEventListener("input", stopInterval);



        //Create circles
        var currentSelectedBubble;
        var circles;
        createBubbles(summarizedData)
        function createBubbles(data) {
            circles = svg.selectAll(".animal")
            .data(data)
            .enter().append("circle")
            .attr("class", "animal")
            .attr("r", function (d) {
                return radiusScale(d[currentSliderDate])
            })

            //OnBubble click
            .on('click', function (d) {
                if(finishIntro === false) {
                 colorizeBubbles();
                 createLabels(summarizedData);
                 var elmnt = document.getElementById("graph");
                 elmnt.scrollIntoView();

                 biomassLabel.style.display = "block";
                 bubbleButtons.style.display = "flex";
                 tonneAmount.style.display = "flex";

                 clearInterval(sliderIterator);
                 finishIntro = true;
                }
                currentSelectedBubble = this;
                labelChanger(d)
            })

        }


        //colorize Bubbles for intro
        circles.style("fill", function (d) {
                return "rgb(195,172,147)"
        })


        //colorizeBubbles()
        function colorizeBubbles() {
            circles.style("fill", function (d) {
                if (d.Animal === "Wild Animals") {
                    return "rgb(160,179,138)"
                } else if (d.Animal === "Humans") {
                    return "rgb(137,194,203)"
                } else {
                    return "rgb(219,196,164)"
                }
            })
        }


        var label
        //createLabels(summarizedData)
        function createLabels(data) {
        label = svg.selectAll(null)
            .data(data)
            .enter()
            .append('text')
            .style("text-anchor", "middle")
            .text(d => d.Animal)
            .style("fill", "rgb(97,97,97)")
            .attr("font-size", function (d) {
                return radiusScale(d[currentSliderDate] / 20)
            })
            .on("click", function (d) {
                labelChanger(d)
            })
            .on('mouseover', function (d) {
                d3.select(this).style("cursor", "default");
            })


        }

        function labelChanger(d) {

            //Selected tools
            d3.selectAll("circle").style("stroke", "none") //remove selected bubbles
            d3.select(currentSelectedBubble).style("stroke", "rgb(134,139,145)") //Give selected bubble a stroke

            //set biomass
            document.getElementById("bubble-animal").innerHTML = d.Animal;
            biomassAmount = d[currentSliderDate]
            document.getElementById("bubble-amount").innerHTML = Math.round(biomassAmount);
            selectedAnimal = d.Animal
            selectedAnimalBiomass = Math.round(biomassAmount)
        }

        //Join and split Buttons
        d3.select("#split").on('click', function (d) {
            simulation.force("x", forceXSeperate)
                .alphaTarget(0.5)
                .restart()
        })

        d3.select("#join").on('click', function (d) {
            simulation.force("x", forceXCombine)
                .alphaTarget(0.5)
                .restart()
        })


        d3.select("#detail-farm-animals").on('click', function (d) {
            circles.remove()
            label.remove()
            //ready(error, completeAnimalData)
            createBubbles(detailedData)
            colorizeBubbles()
            createLabels(detailedData)

            simulation.nodes(detailedData)
                .on('tick', ticked)

            simulation.force("x", forceXCombine)
                .alphaTarget(0.5)
                .restart()
        })

        d3.select("#summarized-farm-animals").on('click', function (d) {
            circles.remove()
            label.remove()
            //ready(error, completeAnimalData)
            createBubbles(summarizedData)
            colorizeBubbles()
            createLabels(summarizedData)

            simulation.nodes(summarizedData)
                .on('tick', ticked)

            simulation.force("x", forceXCombine)
                .alphaTarget(0.5)
                .restart()
        })


        simulation.nodes(summarizedData)
            .on('tick', ticked)

        //Update all circles and labels in x,y axis
        function ticked() {
            circles
                .attr("cx", function (d) {
                    return d.x
                })
                .attr("cy", function (d) {
                    return d.y
                })

            if(finishIntro === true){
                label.attr('x', (d) => {
                return d.x
            })
                .attr('y', (d) => {
                    return d.y + 10
                });
            }
        }

    }

    this.destroy()
}, {
    offset: '100%'
});



