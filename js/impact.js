var w = d3.select('#impact-parent').node().getBoundingClientRect().width,
  h = window.innerHeight - 5,
  eps = 0.0001;
var nodes = [];
var force, root, svg, button;
var blue = d3.rgb(50, 50, 100),
  red = d3.rgb(100, 50, 50),
  green = d3.rgb(50, 100, 50);
var redColorArray = [
  d3.rgb(245,241,231),
  d3.rgb(242,221,212),
  d3.rgb(239,201,193),
  d3.rgb(236,181,173),
  d3.rgb(233,161,154),
  d3.rgb(230,141,135),
  d3.rgb(227,120,116),
  d3.rgb(223,100,96),
  d3.rgb(220,80,77),
  d3.rgb(217,60,58),
  d3.rgb(214,40,39),
  d3.rgb(211,20,19),
  d3.rgb(208,0,0)
]
var size = 1250;
var pause = false;
var impactNum = 2;
var willingness = 0.5;
var finished = 0;

function startSim() {
  finishes = 0;
  pause = false;
  d3.select("svg").remove();
  svg = d3.select("#impact").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

  nodes = d3.range(size).map(function () { return { radius: 10, infected: Math.random() < 0.01, touches: 0, willing: Math.random() }; });

  force = d3.layout.force()
    .gravity(0.002)
    .charge(function (d, i) { return i ? 0 : -50; })
    .nodes(nodes)
    .size([w, h]);

  root = nodes[0];
  root.radius = 0;
  root.fixed = true;
  root.touches = 1;
  root.willing = 0;

  force.start();

  svg.selectAll("circle")
    .data(nodes.slice(1))
    .enter().append("svg:circle")
    .attr("r", function (d) { return d.radius; })
    .style("fill", function (d, i) { return redColorArray[0]; })

  button = svg.append('svg:text')

    .text('reset')
    .attr('width', w / 10)
    .attr('height', h / 10)
    .attr("transform", "translate(" + (w / 2 - w / 40) +
      "," + (h / 2) + ")")
    .style("visibility", "hidden")
    .style('fill', 'white')
    .attr("font-size", "20px")
    .style('cursor', 'pointer')
    .on('click', startSim);



  force.on("tick", function (e) {
    var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

    while (++i < n) {
      q.visit(collide(nodes[i]));
      //if(Math.random()<0.1){ nodes[i].style('fill','red'); }
    }

    svg.selectAll("circle")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });

  });
}

startSim();

/*Run simulation of impact every second. */
setInterval(function () {
  if (!pause) {
    finished = 0;
    var i = 0, n = nodes.length;

    for (i = 0; i < n; i++) {
      nodes[i].touched = false;
      if (nodes[i].touches > 0 & (nodes[i].willing <= willingness) & !nodes[i].touched) {
        for (j = 0; j < impactNum; j++) {
          let randomNode = Math.floor(Math.random() * n);
          if(Math.random() < 0.5) {
            nodes[randomNode].touches += 1;
            nodes[randomNode].touched = true;
          }
        }
      }
      if(nodes[i].touches >= redColorArray.length){
        finished += 1;
      }
      if(finished === size) {
        console.log("Done!");
        pause = true;
      }
    }
    svg.selectAll("circle").style("fill", function (d, i) {
      var col = redColorArray[redColorArray.length - 1];
      if (nodes[i].touches < redColorArray.length) {
        col = redColorArray[nodes[i].touches];
      }
      return col;
    });

    mousedown();
    console.log(finished);
  }
}, 1000);

// svg.on("mousemove", function () {
//   var p1 = d3.svg.mouse(this);
//   root.px = p1[0];
//   root.py = p1[1];
//   force.resume();
// });

function collide(node) {
  var r = node.radius,
    nx1 = node.x - r,
    nx2 = node.x + r,
    ny1 = node.y - r,
    ny2 = node.y + r;
  return function (quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
        y = node.y - quad.point.y,
        l = Math.sqrt(x * x + y * y),
        r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2
      || x2 < nx1
      || y1 > ny2
      || y2 < ny1;
  };
}

// d3.select("body").on("mousedown", mousedown);

function mousedown() {
  nodes.forEach(function(o, i) {
    o.x += (Math.random() - .5) * 40;
    o.y += (Math.random() - .5) * 40;
  });
  force.resume();
}

$('#impactNum').slider({
  formatter: function (value) {
    return 'Current value: ' + value;
  }
}).on('slide', function (slideEvt) {
  impactNum = slideEvt.value;
});

$('#willingness').slider({
  formatter: function (value) {
    return 'Current value: ' + value;
  }
}).on('slide', function (slideEvt) {
  willingness = slideEvt.value * 0.01;
});
$('#pause').on('click', function () {
  pause = !pause;
});

$('#size').slider({
  formatter: function (value) {
    return 'Current value: ' + value;
  }
}).on('slide', function (slideEvt) {
  size = slideEvt.value;
});

$('#reset1').on('click', startSim);
$('#reset2').on('click', startSim);