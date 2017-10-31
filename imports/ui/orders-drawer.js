import * as d3 from "d3";

class OrdersDrawer {
  constructor(orders) {
    this.orders = orders;
    this.graphWidth = 1000;
    this.graphHeight = 500;
    this.xAxisHeight = 30;
    this.yAxisWidth= 35;
    this.totalWidth = this.graphWidth + this.yAxisWidth;
    this.totalHeight = this.graphHeight + this.xAxisHeight;
    this.topMargin = 10;

    this.xScale = d3.scaleTime().domain([new Date('2017-10-30'), new Date()]).range([this.yAxisWidth, this.totalWidth]).clamp(true);
    this.yScale = d3.scaleLinear().domain([600, 1400]).range([this.graphHeight, 0]);
    this.lineDescriber = d3.line().curve(d3.curveStepAfter).x((d) => {return this.xScale(d.timestamp)}).y((d) => {return this.yScale(d.price)});
  }

  draw() {
    const svg = d3.select('#orders-svg').attr('viewBox', `0 0 ${this.totalWidth} ${this.totalHeight + this.topMargin}`);
    const graph = svg.append('g').attr('transform', `translate(0, ${this.topMargin})`);

    this.drawAxes(graph);
    this.drawLines(graph);
  }

  drawLines(graph) {
    const lines = graph.append('g').selectAll('path').data(this.orders);
    lines.exit().remove();

    lines.enter().append('path').attr('fill', 'none')
      .attr('stroke', (d) => {
        const last = _.last(d.history);
        const opacity = 0.05 * last.quantity;

        return `rgba(0, 0, 0, ${opacity})`;
      })
      .attr('d', (d) => {
        const history = Array.from(d.history);

        const last = Object.assign({}, _.last(history), {timestamp: d.lastActiveAt});
        history.push(last);

        return this.lineDescriber(history);
      });
  }

  drawAxes(graph) {
    const xAxis = d3.axisBottom(this.xScale).ticks(d3.timeDay.every(1));
    const xAxisGroup = graph.append('g').attr('transform', `translate(0, ${this.graphHeight})`);
    xAxisGroup.call(xAxis);

    const yAxis = d3.axisLeft(this.yScale).ticks(10);
    const yAxisGroup = graph.append('g').attr('transform', `translate(${this.yAxisWidth}, 0)`);
    yAxisGroup.call(yAxis);
  }
}

module.exports.OrdersDrawer = OrdersDrawer;
