import { Component, Input } from '@angular/core';
import { NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Locker } from 'angular-safeguard';
import { SessionService } from '../../ngx-tryton';

import { InfiniteList } from '../../ionic-tryton-infinite-list/infinite-list';
import { EncodeJSONRead } from '../../ngx-tryton-json/encode-json-read';
import { TrytonProvider } from '../../ngx-tryton-providers/tryton-provider';
import { CustomerShipmentsDetailsPage } from "../shipments-customer-details/shipments-customer-details";


@Component({
  selector: 'page-shipments-customer-shipments-list',
  templateUrl: 'shipments-customer-list.html'
})

export class CustomerShipmentsListPage extends InfiniteList {
  method: string;
  domain: any[];
  fields: string[];
  shipmentList: any[];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public tryton_provider: TrytonProvider, public events: Events,
    public translate: TranslateService, public locker: Locker,
    public alertCtrl: AlertController, public tryton_session: SessionService) {

    super(navCtrl, tryton_provider, events);

    this.method = 'stock.shipment.out';
    this.domain = [['state', '=', 'assigned']];
    this.fields = ['number', 'reference', 'customer.name', 'comment',
      'planned_date', 'state', 'inventory_moves:[]', 'outgoing_moves:[]'];
  }

  ionViewWillEnter() {
    this.setDefaultDomain();
    this.loadData();
  }

  public itemSelected(e, item) {
    this.navCtrl.push(CustomerShipmentsDetailsPage, {shipment: item})
  }

  /**
   * Refresh data feed
   * @param  {event} refresher Refresh event
   * @return {null}            No return
   */
  public doRefresh(refresher){
    this.setDefaultDomain();
    this.loadData();
    this.events.subscribe('Data loading finished' ,(eventData) => {
      refresher.complete();
    })
  }

  /**
   * Sets the default domain for the search
   * @return {null} No return
   */
  public setDefaultDomain() {
  }

}
