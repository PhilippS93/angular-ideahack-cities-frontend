import { Component, Inject, OnInit } from '@angular/core';
import { GeoLocationService } from '../../services/geo-location-service.service';
// import { DOCUMENT } from '@angular/common';
// import { getStyle, rgbToHex } from '@coreui/coreui/dist/js/coreui-utilities';

@Component({
  templateUrl: 'colors.component.html',
  styles: ['agm-map { height: 100%; }']
})
export class ColorsComponent implements OnInit {

  // latitude = -28.68352;
  // longitude = -147.20785;
  mapType = 'roadmap';

  constructor(private geoLocationService: GeoLocationService) { }

  coordinates;
  ngOnInit() {
    this.geoLocationService.getPosition().subscribe(
        (pos: Position) => {
            this.coordinates = {
              latitude:  +(pos.coords.latitude),
              longitude: +(pos.coords.longitude)
            };
        });
    }
  }
