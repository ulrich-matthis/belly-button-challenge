// Display defaults
function init() {

    var selector = d3.select("#selDataset");
// Use D3 to pull name data from JSON
    d3.json("samples.json").then((data) => {
        var sampleNames = data.names;
// Used to verify name collection
        console.log(data)
// Data available for selector
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });
// Data prepped for later use in charts
        var firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });

}

init();
// Allows new sample to be selected from the drop down box
function optionChanged(newSample) {

    buildMetadata(newSample);
    buildCharts(newSample);

}
// Lines below construct the panel for each Demographic Info for the IDs
function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
        var metadata = data.metadata;

        var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
        var result = resultArray[0];

        var PANEL = d3.select("#sample-metadata");

// Clears prior charts so new selection data can be displayed
        PANEL.html("")

// Displays the above result array in the Demographic Info section of the dashboard
        Object.entries(result).forEach(([key, value]) => {
            PANEL.append("h5").text(`${key.toUpperCase()}: ${value}`);
          });

    });
}

// Below funcion used to prep json file information for charting.
function buildCharts(sample) {
    d3.json("samples.json").then((data) => {

// List of variables to use within our charts below        
        var samples = data.samples;
        var desiredSampleNumber = samples.filter(sampleObj => sampleObj.id == sample);
        var resultArray = data.metadata.filter(sampleObj => sampleObj.id == sample);

        var firstSample = desiredSampleNumber[0];
        var result = resultArray[0];

        var otu_ids = firstSample.otu_ids;
        var otu_labels = firstSample.otu_labels;
        var sample_values = firstSample.sample_values;
        var wash_frequency = result.wfreq;


        var ytick = otu_ids.slice(0, 10).map(otuID => `OTU: ${otuID}`).reverse()

// Bar chart creation, syntax sourced from documentation        
        var barChart =[{
            type: 'bar',
            x: sample_values.slice(0, 10).reverse(),
            y: ytick,
            orientation: 'h',
            text: otu_labels.slice(0, 10).reverse()
        }];

// Layout of graph

        var barLayout = {
            title: 'Top 10 Most Common Bacterial Cultures',
            margin: {
                t: 30, l: 100
            },

        };
// Graph inserted into the dashboard
        Plotly.newPlot('bar', barChart, barLayout);

// Creation of bubble chart using created variables and supplemented code from documentation.
        var bubbleData = {
            x: otu_ids,
            y: sample_values,
            mode: 'markers',
            marker: {
                color: otu_ids,
                size: sample_values,
                colorscale: "Greens"
            }
        };
// Layout of graph
        var bubbleDataLayout = {
            title: 'Cultures per Sample',
            xaxis: { title: "OTU ID"},
            margin: { t: 50},
        };
// Graph inserted into the dashboard
        Plotly.newPlot("bubble", [bubbleData], bubbleDataLayout);

// Gauge creation, below code sourced from documentation
// Gauge created, unable to create the needle so a bar is provided as a visual along
// with a number within the gauge
        var gaugeData = [
            {
            domain: { x: [0, 1], y: [0, 1] },
            value: wash_frequency,
            title: { text: "Belly Button Washing Frequency" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [null, 9], tickcolor: "black" },
                bar: { color: "black" },
                bgcolor: "transparent",
                borderwidth: 2,
                bordercolor: "gray",
                steps: [
                 { range: [0, 4], color: "red" },
                 { range: [4, 5], color: "orange" },
                 { range: [5, 6], color: "yellow" },
                 { range: [6, 8], color: "yellowGreen" },
                 { range: [8, 9], color: "green" }
                ],
            }
        }
        ];
    
        var layout = {
            width: 500, height: 400, margin: { t: 0, b: 0 }
        };
// https://www.w3schools.com/jsref/met_win_settimeout.asp syntax below was researched from this link.   
// Graph inserted into the dashboard
        //setTimeout(function() {
        Plotly.newPlot('gauge', gaugeData, layout);
        }, 1000);

}