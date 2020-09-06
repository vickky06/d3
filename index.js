const D3Node = require('d3-node');

function pie({
  data,
  selector: _selector = '#chart',
  container: _container = `
    <div id="container">
      <h2>Pie Chart</h2>
      <div id="chart"></div>
    </div>
  `,
  style: _style = '',
  colorRange: _colorRange = undefined,
  width: _width = 960,
  height: _height = 500,
  radius: _radius = 200
} = {}) {
  const _svgStyles = `
    .arc text {font: 10px sans-serif; text-anchor: middle;}
    .arc path {stroke: #fff;}
  `;

  const d3n = new D3Node({
    selector: _selector,
    styles: _svgStyles + _style,
    container: _container
  });

  const d3 = d3n.d3;

  const radius = _radius;

  const color = d3.scaleOrdinal(_colorRange ? _colorRange : d3.schemeCategory10);

  const arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  const labelArc = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

  const pie = d3.pie()
    .sort(null)
    .value((d) => d.value);

  const svg = d3n.createSVG()
    .attr('width', _width)
    .attr('height', _height)
    .append('g')
    .attr('transform', `translate( ${_radius} , ${_radius} )`);

  const g = svg.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'arc');

  g.append('path')
    .attr('d', arc)
    .style('fill', (d) => color(d.data.label));

  g.append('text')
    .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
    .attr('dy', '.35em')
    .text((d) => d.data.label);

  return d3n;
}
function line({
  data,
  selector: _selector = '#chart',
  container: _container = `
    <div id="container">
      <h2>Line Chart</h2>
      <div id="chart"></div>
    </div>
  `,
  style: _style = '',
  width: _width = 960,
  height: _height = 500,
  margin: _margin = { top: 20, right: 20, bottom: 60, left: 30 },
  lineWidth: _lineWidth = 1.5,
  lineColor: _lineColor = 'steelblue',
  lineColors: _lineColors = ['steelblue'],
  isCurve: _isCurve = true,
  tickSize: _tickSize = 5,
  tickPadding: _tickPadding = 5,
} = {}) {
  const d3n = new D3Node({
    selector: _selector,
    svgStyles: _style,
    container: _container,
  });

  const d3 = d3n.d3;

  const width = _width - _margin.left - _margin.right;
  const height = _height - _margin.top - _margin.bottom;

  const svg = d3n.createSVG(_width, _height)
        .append('g')
        .attr('transform', `translate(${_margin.left}, ${_margin.top})`);

  const g = svg.append('g');

  const { allKeys } = data;
  const xScale = d3.scaleLinear()
      .domain(allKeys ? d3.extent(allKeys) : d3.extent(data, d => d.key))
      .rangeRound([0, width]);
  const yScale = d3.scaleLinear()
      .domain(allKeys ? [d3.min(data, d => d3.min(d, v => v.value)), d3.max(data, d => d3.max(d, v => v.value))] : d3.extent(data, d => d.value))
      .rangeRound([height, 0]);
  const xAxis = d3.axisBottom(xScale)
        .tickSize(_tickSize)
        .tickPadding(_tickPadding);
  const yAxis = d3.axisLeft(yScale)
        .tickSize(_tickSize)
        .tickPadding(_tickPadding);

  const lineChart = d3.line()
      .x(d => xScale(d.key))
      .y(d => yScale(d.value));

  if (_isCurve) lineChart.curve(d3.curveBasis);

  g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  g.append('g').call(yAxis);

  g.append('g')
    .attr('fill', 'none')
    .attr('stroke-width', _lineWidth)
    .selectAll('path')
    .data(allKeys ? data : [data])
    .enter().append("path")
    .attr('stroke', (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor)
    .attr('d', lineChart);

  return d3n;
}
const defaultMargins = ({ xAxis, yAxis } = {}) => ({
  top: 20,
  right: 20,
  bottom: xAxis ? 40 : 30,
  left: yAxis ? 50 : 40,
})

function bar({
  data,
  selector: _selector = '#chart',
  container: _container = `
    <div id="container">
      <h2>Bar Chart</h2>
      <div id="chart"></div>
    </div>
  `,
  style: _style = '',
  width: _width = 960,
  height: _height = 500,
  margin: _margin = defaultMargins(arguments[0].labels),
  barColor: _barColor = 'steelblue',
  barHoverColor: _barHoverColor = 'brown',
  labels: _labels = { xAxis: '', yAxis: '' },
} = {}) {
  const _svgStyles = `
    .bar { fill: ${_barColor}; }
    .bar:hover { fill: ${_barHoverColor}; }
  `;

  const d3n = new D3Node({
    selector: _selector,
    styles: _svgStyles + _style,
    container: _container,
  });

  const d3 = d3n.d3;

  const width = _width - _margin.left - _margin.right;
  const height = _height - _margin.top - _margin.bottom;

  // set the ranges
  const x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);

  const y = d3.scaleLinear()
          .range([height, 0]);

  const svg = d3n.createSVG(_width, _height)
    .append('g')
    .attr('transform', `translate(${_margin.left}, ${_margin.top})`);

  x.domain(data.map((d) => d.key));
  y.domain([0, d3.max(data, (d) => d.value)]);

  // append the rectangles for the bar chart
  svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => height - y(d.value));

  // add the x Axis
  svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

  // text label for the x Axis
  svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height + _margin.bottom - 5})`)
      .style('text-anchor', 'middle')
      .text(_labels.xAxis);

  // add the y Axis
  svg.append('g').call(d3.axisLeft(y));

  // text label for the y Axis
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - _margin.left)
    .attr('x',0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text(_labels.yAxis);

  return d3n;
}
module.exports = {pie,line,bar};
