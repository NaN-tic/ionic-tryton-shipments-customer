import { Component, HostListener, ElementRef } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";

import { EncodeJSONRead } from '../../ngx-tryton-json/encode-json-read';
import { EncodeJSONWrite } from '../../ngx-tryton-json/encode-json-write';
import { TrytonProvider } from '../../ngx-tryton-providers/tryton-provider';

import { CustomerShipmentsDetailsPage } from "../shipments-customer-details/shipments-customer-details";

// Interfaces
import { CustomerShipment } from '../../ngx-tryton-stock-interface/shipment';

@Component({
  selector: 'page-shipments-customer-notes',
  templateUrl: 'shipments-customer-notes.html'
})

export class CustomerShipmentsNotesPage {
  notes: string;
  method: string;
  shipment: CustomerShipment;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public element: ElementRef,
    public trytonProvider: TrytonProvider) {

    this.method = 'stock.shipment.out';
    this.shipment = navParams.get('shipment');
  }

  saveNote() {
    let notes = this.element.nativeElement.querySelector("textarea");

    let json_constructor = new EncodeJSONWrite;
    let comment = this.shipment.comment ? this.shipment.comment+'\n'+notes.value : notes.value;
    this.shipment.comment = comment;
    console.log(this.shipment.comment);

    let values = { comment: comment }
    json_constructor.addNode(this.method, [this.shipment.id, values])
    let json = json_constructor.createJSON()
    this.trytonProvider.write(json).subscribe(
      data => {
        this.navCtrl.push(CustomerShipmentsDetailsPage, {shipment: this.shipment})
      },
      error => {
        console.log("Error", error);
        alert(error.messages[0])
      })
  }

  @HostListener("input", ["$event.target"])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  adjust(): void {
    let ta = this.element.nativeElement.querySelector("textarea");
    ta.style.overflow = "hidden";
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

}
