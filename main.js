var svg = d3.select('svg');
var y_scatter;
var x_scatter;
var yOption = 'imdb_score';
var xOption = 'duration';
var yearOption = 'Year_All'

var x_DataPoint;
var y_DataPoint;
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var padding = {t: 30, r: 60, b: 60, l: 60};
var cellPadding = 10;

var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var cellHeight = (svgHeight - padding.t - padding.b);
var cellWidth = (svgWidth - padding.l - padding.r) / 2;


var xScale = d3.scaleLinear().range([0, cellWidth - cellPadding]);
var yScale = d3.scaleLinear().range([cellHeight - cellPadding, 0]);

function updateOption(selectionID, optionType) {
    var select = d3.select(selectionID).node();
    var option = select.options[select.selectedIndex].value;
    switch (optionType) {
        case "xScatterAxis":
            xOption = option;
            break;
        case "yScatterAxis":
            yOption = option;
            break;
        case "year":
            yearOption = option;
            break;
    }
    updateScatterChart(xOption, yOption, yearOption);
}

function yScatterAxis() { updateOption('#ySelect', 'yScatterAxis');}

function xScatterAxis() { updateOption('#xSelect', 'xScatterAxis');}

function year() {updateOption('#year', 'year');}

var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-16, 0])
    .html(function(event, d) {
        return "<h5>"+d['movie_title']+"</h5>"
            + "<p>Content rating: "+d['content_rating']+"</p>";
});

svg.call(toolTip);

var movie_Title = d3.select("#bar-chart")
    .append("div")
    .attr("class", "movie-title")
    .style("padding-left", "50px")
    .style("font-weight", "bold");


var bar_padding = {top: 10, right: 24, bottom: 20, left: 200},
    barWidth = 296;
    barHeight = 170;

var xBarChartScale = d3.scaleLinear()
    .range([0, barWidth]);

var yBarChartScale = d3.scaleBand()
    .range([0, barHeight])
    .padding(0.3);

var svgHorizontalBar = d3.select("#bar-chart")
    .append("svg")
    .attr("width", barWidth + bar_padding.left + bar_padding.right)
    .attr("height", barHeight + bar_padding.top + bar_padding.bottom)
    .append("g")
    .attr("transform", "translate(" + bar_padding.left + "," + bar_padding.top + ")");


function updateHorizontalBarChart(movie) {
    movie_Title.html(movie.movie_title);

    var facebookLikesData = [
        { type: "actor_1_facebook_likes", value: movie.actor_1_facebook_likes },
        { type: "actor_2_facebook_likes", value: movie.actor_2_facebook_likes },
        { type: "actor_3_facebook_likes", value: movie.actor_3_facebook_likes },
        { type: "director_facebook_likes", value: movie.director_facebook_likes },
        { type: "cast_total_facebook_likes", value: movie.cast_total_facebook_likes },
        { type: "movie_facebook_likes", value: movie.movie_facebook_likes }
    ];

    var max_facebookLikes = d3.max(facebookLikesData, d => d.value);

    xBarChartScale.domain([0, max_facebookLikes]);
    yBarChartScale.domain(facebookLikesData.map(d => d.type));

    svgHorizontalBar.selectAll(".bar")
        .data(facebookLikesData)
        .join("rect")
        .attr("class", "bar")
        .attr("y", d => yBarChartScale(d.type))
        .attr("height", yBarChartScale.bandwidth())
        .style("fill", "navy")
        .transition()
        .attr("x", 0)
        .attr("width", d => xBarChartScale(d.value));

    svgHorizontalBar.selectAll(".y-label")
        .data(facebookLikesData)
        .join("text")
        .attr("class", "y-label")
        .attr("id", "bar-label")
        .attr("y", d => yBarChartScale(d.type) + yBarChartScale.bandwidth() / 2)
        .attr("x", d => -10)
        .style("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(d => d.type);


    svgHorizontalBar.selectAll(".x.axis")
        .data([0])
        .join("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${barHeight})`)
        .call(d3.axisBottom(xBarChartScale).ticks(8).tickValues([0, 20000, 40000, 60000, 80000, 100000, 120000]));
}


var dataPoints = svg.append('g')
    .attr('transform', 'translate('+[padding.l+30, padding.t]+')');


function dataPreprocessor(row) {
    const fieldsToConvert = [
        'director_name', 'num_critic_for_reviews', 'duration',
        'director_facebook_likes', 'actor_3_facebook_likes', 'actor_2_name',
        'actor_1_facebook_likes', 'gross', 'num_voted_users', 'budget',
        'title_year', 'actor_2_facebook_likes', 'imdb_score', 'aspect_ratio',
        'movie_facebook_likes'
    ];

    var result = {};

    for (var key in row) {
        if (fieldsToConvert.includes(key)) {
            result[key] = +row[key];
        } else {
            result[key] = row[key];
        }
    }
    return result;
}

function processMoviesData(dataset) {
  movies = dataset;
  x_DataPoint = d3.scaleLinear().domain([Math.max(60, d3.min(movies, function(d) {return +d['duration'];})), d3.max(movies, function(d) {return +d[xScatterAxis];})]).range([60,700]);

  y_DataPoint = d3.scaleLinear().range([340,20]).domain(d3.extent(movies, function(d){return d['imdb_score'];}));

  var xAxisScatter = d3.axisBottom(x_DataPoint).ticks(8);
  var yAxisScatter = d3.axisLeft(y_DataPoint).ticks(8);

  createScatterplot(xAxisScatter, yAxisScatter);
  updateScatterChart(xOption, yOption, yearOption);
}

function createScatterplot(xAxisScatter, yAxisScatter) {
  dataPoints.append('g')
    .attr('class','x axis')
    .attr('transform', 'translate(0,350)')
    .call(xAxisScatter);

  y_scatter = dataPoints.append('text')
    .text('option3')
    .attr('class', 'label')
    .attr("font-weight", 650)
    .attr('transform','translate(-28,110) rotate(270)');

  x_scatter = dataPoints.append('text')
    .text('option2')
    .attr('class', 'label')
    .attr("font-weight", 650)
    .attr('transform','translate(0,380)');

  dataPoints.append('g')
    .attr('class','y axis')
    .call(yAxisScatter);
}

category = document.getElementById('ySelect').value;
d3.csv('movies.csv', dataPreprocessor).then(processMoviesData);

function updateScatterChart(filterKeyX, filterKeyY, year) {
    updateScatterplotLabels(filterKeyX, filterKeyY);
    updateScatterplotAxes(filterKeyX, filterKeyY);
    updateScatterplotData(filterKeyX, filterKeyY, year);
}

function updateScatterplotLabels(filterKeyX, filterKeyY) {
    y_scatter.text(filterKeyY)
        .attr("font-weight", 650)
    x_scatter.text(filterKeyX)
        .attr("font-weight", 650)
}

function updateScatterplotAxes(filterKeyX, filterKeyY) {
    y_DataPoint.domain(d3.extent(movies, d => d[filterKeyY]));
    x_DataPoint.domain(d3.extent(movies, d => d[filterKeyX]));

    var yAxisScatter = d3.axisLeft(y_DataPoint).ticks(10);
    var yScatterAxis = dataPoints.select(".y.axis");

    yScatterAxis.transition()
        .call(yAxisScatter);

    var xAxisScatter = d3.axisBottom(x_DataPoint).ticks(10);
    var xScatterAxis = dataPoints.select(".x.axis");

    xScatterAxis.transition()
        .call(xAxisScatter);
}


function updateScatterplotData(filterKeyX, filterKeyY, year) {
    var year_filter;
    year_filter = year === 'Year_All' ? movies : movies.filter(d => d["title_year"] == +year);

    var dots = dataPoints.selectAll(".dot").data(year_filter, d => d.name);

    var dot_click = dots.enter()
        .append('circle')
        .attr('class', 'dot')

    dots.merge(dot_click)
        .attr("transform", d => "translate(" + x_DataPoint(d[filterKeyX]) + "," + y_DataPoint(d[filterKeyY]) + ")")
        .attr("r", 2)
        .style("fill", d => colorScale(d.title_year));

    dots.exit().remove();

    handleDotsEvents(dot_click);
}


function handleDotsEvents(dot_click) {
    dot_click.on("mouseover", (event, d) => toolTip.show(event, d))
        .on("mouseout", d => toolTip.hide(d))
        .on("click", (event, d) => {
            updateHorizontalBarChart(d);
            var barLabels = d3.selectAll("#bar-label");
            d3.selectAll("#bar-label").style("visibility", "hidden");
            svgHorizontalBar.selectAll(".x.axis").remove();
            if (barLabels.style("visibility") === "hidden") {
                updateHorizontalBarChart(d);
                barLabels.style("visibility", "visible");
            }
        })
        .on("dblclick", () => {
            svgHorizontalBar.selectAll(".bar").remove();
            movie_Title.html("");
            d3.selectAll("#bar-label").style("visibility", "hidden");
            svgHorizontalBar.selectAll(".x.axis").remove();
        });
}


var legendGroup = svg.append("g")
  .attr("transform", "translate(700, 30)");

legendGroup.append("text")
  .text("Movie Year")
  .style("font-size", "15px");

var movieYears = ["2010", "2011", "2012", "2013", "2014", "2015", "2016"];

var colorMapping = d3.scaleOrdinal()
  .domain(movieYears)
  .range(d3.schemeSet1);

var customColorPalette = ["red", "blue", "brown", "purple", "green", "orange", "pink"];

var legendColorScale = d3.scaleOrdinal()
  .domain(movieYears)
  .range(customColorPalette);

legendGroup.selectAll("rect")
  .data(movieYears)
  .enter()
  .append("rect")
    .attr("x", 0)
    .attr("y", function(d,i){ return 20 + i* 16})
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", function(d){ return legendColorScale(d)}); 

legendGroup.selectAll("text.yearLabel")
    .data(movieYears)
    .enter()
    .append("text")
    .attr("class", "yearLabel")
    .attr("x", 22)
    .attr("y", function(d,i){ return 20 + i*16 + 6})
    .style("fill", function(d){ return legendColorScale(d)}) 
    .text(function(d){ return d})
    .style("dominant-baseline", "middle");
