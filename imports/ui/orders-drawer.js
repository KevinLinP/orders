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
    this.yScale = d3.scaleLinear().domain([500, 1400]).range([this.graphHeight, 0]);
    this.lineDescriber = d3.line().curve(d3.curveStepAfter).x((d) => {return this.xScale(d.timestamp)}).y((d) => {return this.yScale(d.price)});
  }

  draw() {
    const svg = d3.select('#orders-svg').attr('viewBox', `0 0 ${this.totalWidth} ${this.totalHeight + this.topMargin}`);
    const graph = svg.append('g').attr('transform', `translate(0, ${this.topMargin})`);

    this.drawAxes(graph);
    this.drawLines(graph);
  }

  drawLines(graph) {
    const lines = graph.append('g').selectAll('g').data(this.orders);
    lines.exit().remove();

    const drawOrderLines = this.drawOrderLines.bind(this);
    lines.enter().append('g').each(function(order) {
      const group = d3.select(this);
      drawOrderLines(group, order);
    });
  }

  drawOrderLines(group, order) {
    let currentQuantityEvents = [];
    
    order.history.forEach((event, i) => {
      if (i == 0) {
        currentQuantityEvents.push(event);
        return;
      }

      if (_.last(currentQuantityEvents).quantity == event.quantity) {
        currentQuantityEvents.push(event);
      } else {
        currentQuantityEvents.push(event);
        this.drawQuantityLine(group, currentQuantityEvents);

        currentQuantityEvents = [];
        currentQuantityEvents.push(event);
      }
    });

    const last = Object.assign({}, _.last(order.history), {timestamp: order.lastActiveAt});
    currentQuantityEvents.push(last);
    this.drawQuantityLine(group, currentQuantityEvents);
  }

  drawQuantityLine(group, events) {
    group.append('path').attr('fill', 'none').attr('stroke', () => {
      const opacity = 0.05 * _.first(events).quantity;
      return `rgba(0, 0, 0, ${opacity})`;
    }).attr('d', () => {
      return this.lineDescriber(events);
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
