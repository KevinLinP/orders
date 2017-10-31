import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import * as d3 from "d3";

import { Orders } from '../api/orders.js';
import { OrdersDrawer } from '../ui/orders-drawer.js';

import './orders.html';

Tracker.autorun(() => {
  const orders = Orders.find({}).fetch();

  const drawer = new OrdersDrawer(orders);
  drawer.draw();
});
