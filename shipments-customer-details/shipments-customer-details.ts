import { Component, OnInit } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";

import { EncodeJSONRead } from '../../ngx-tryton-json/encode-json-read';
import { TrytonProvider } from '../../ngx-tryton-providers/tryton-provider';

import { CustomerShipmentsNotesPage } from "../shipments-customer-notes/shipments-customer-notes";
import { CustomerShipmentsListPage } from "../shipments-customer-list/shipments-customer-list";

// Interfaces
import { CustomerShipment } from '../../ngx-tryton-stock-interface/shipment';

@Component({
  selector: 'page-shipments-customer-details',
  templateUrl: 'shipments-customer-details.html'
})

export class CustomerShipmentsDetailsPage implements OnInit{
  shipment: CustomerShipment;
  boxSearchInput: string;
  productSearchInput: any;
  method: string;
  domain: any;
  fields: any;
  moves: any;
  scannig_item: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public trytonProvider: TrytonProvider) {
    this.boxSearchInput = '';
    this.productSearchInput = '';

    this.shipment = navParams.get('shipment');
    this.fields = ['company', 'number', 'reference', 'customer.name', 'comment',
      'planned_date', 'state', 'inventory_moves:[]', 'outgoing_moves:[]'];
    let json_constructor = new EncodeJSONRead;
    this.domain = [json_constructor.createDomain('id', '=', this.shipment.id)];
  }

  ionViewDidEnter() { (this.moves)? this.scanningProcces(): console.log(this.moves) }

  ngOnInit() {
      this.getShipmentMoves();
  }

  getShipmentMoves() {
    let method = 'stock.move';
    let ids = [];
    for (let move of this.shipment.inventory_moves) {
      ids.push(move['id']);
    }
    let domain = [['id', 'in', ids]];
    let fields = ['product.name', 'quantity', 'from_location.rec_name', 'to_location.rec_name', 'lot.number'];

    let json_constructor = new EncodeJSONRead;
    json_constructor.addNode(method, domain, fields);
    let json = json_constructor.createJson();

    return this.trytonProvider.search(json).subscribe(
      data => {
        this.moves = data['stock.move'];
        // console.log(this.moves);
      },
      error => {
        console.log(error);
      }
    );
  }

  scanned_move(move_id:string, quantity: string) {
    let method = "stock.move";
    let domain = [['to_location', '=', 'warehouse_output'], ['state', '=' , ' draft']];
    let fields:any = [{'move_id': move_id, 'quantity': quantity}];

    let json_constructor = new EncodeJSONRead;
    json_constructor.addNode(method, domain, fields);
    let json = json_constructor.createJson();
    this.trytonProvider.write(json).subscribe(
      data => console.log(data)
    );
  }

  scanningProcces() {
    this.moves.forEach((item, i) => {
      if(i == 0) {
        document.getElementById(item['id']).classList.add('red');
        this.scannig_item = item;
      }
    });
    this.donePicking()
  }

  donePicking() {
    let qty = this.productSearchInput.toLowerCase();
    if ((this.productSearchInput.length >= 1) && Number(qty) > 0){
      // this.scannig_item['quantity'] = +qty;
      this.moves.filter((item, i) => {

        if (this.scannig_item['id'] == item['id']) {
          // alert('change red to gray')
          // document.getElementById(item['id']).classList.remove('red');
          // document.getElementById(item['id']).classList.add('gray');
          setTimeout(() => {
            this.moves.splice(i, 1);
            this.productSearchInput = '';
            if (this.moves.length >= 1) {
              let next_move = this.moves[0];
              document.getElementById(next_move['id']).classList.add('red');
              this.scannig_item = next_move;
            } else {
              this.scannig_item = null;
            }
          }, 500);
        }
      });

    }
  }

  clearDonePicking() {
    let cls = ['red', 'gray'];
    this.moves.filter(item => {document.getElementById(item['id']).classList.remove(...cls); document.getElementById(this.moves[0]['id']).classList.add('red')});
  }

  deleteLine(id:string): void {
    const move = this.moves;
    move.filter((item, i)=> { (item['id'] == id)? move.splice(i,1): false; });
    this.productSearchInput = '';
    this.scanningProcces();
  }

  pack() {
    return this.trytonProvider.rpc_call("model.stock.shipment.out.pack",
      [[this.shipment.id]]).subscribe(
      data => {
        this.navCtrl.push(CustomerShipmentsListPage);
      },
      error => {
        console.log(error);
      })
  }

  routeToNotes() { this.navCtrl.push(CustomerShipmentsNotesPage, {shipment: this.shipment})}
}
