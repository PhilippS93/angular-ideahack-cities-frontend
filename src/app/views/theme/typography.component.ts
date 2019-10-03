import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeoLocationService } from '../../services/geo-location-service.service';
import { MapsAPILoader } from '@agm/core';
import { google } from '@agm/core/services/google-maps-types';
import { take, startWith, takeUntil } from 'rxjs/internal/operators';
import { HttpClient } from '@angular/common/http';
import { interval, Subject } from 'rxjs';

@Component({
  templateUrl: 'typography.component.html',
  styles: ['agm-map { height: 100%; }']
})
export class TypographyComponent implements OnInit, OnDestroy {

public center_lat = 50.413353;
public center_lng = 7.592934;
center_data = {
  url: 'assets/img/avatars/house.png',
  scaledSize: {
    width: 40,
    height: 40
  }
}

public directions = [];

mapType = 'roadmap';
coordinates;

  trashcans = [];
  _unsubscribe: Subject<any> = new Subject();

  getTrashcanInfos() {
    this.httpClient.get('https://twast-server.herokuapp.com')
    .subscribe((res: any) => {

      let trashes = [];
      for (let obj of res) {
        trashes.push(
          {latitude: obj.latitude,
          longitude: obj.longitude,
          address: '',
          full: obj.entries.map((entry) => entry.kg).reduce((acc, curr) => acc + curr) / obj.capacity});
      }

      this.trashcans = (JSON.stringify(this.trashcans) === JSON.stringify(trashes)) ? this.trashcans : trashes;

      this.updateDirections();
    });
  }

  updateDirections() {

    let full_trashes = [];

    let dirs = [];

    const threshold = 0.8;
    for (let _i = 0; _i < this.trashcans.length; _i++) {

      if (this.trashcans[_i].full >= threshold) {
        full_trashes.push(this.trashcans[_i]);
      }
    }


    let start = {lat: this.center_lat, lng: this.center_lng};
    let target = {lat: full_trashes[0].latitude, lng: full_trashes[0].longitude};
    dirs.push({start: start, target: target});

    for (let _i = 0; _i < full_trashes.length-1; _i++) {
      let start = {lat: full_trashes[_i].latitude, lng: full_trashes[_i].longitude};
      let target = {lat: full_trashes[_i + 1].latitude, lng: full_trashes[_i + 1].longitude};
      dirs.push({start: start, target: target});
    }

    start = {lat: full_trashes[full_trashes.length - 1].latitude, lng: full_trashes[full_trashes.length - 1].longitude};
    target ={lat: this.center_lat, lng: this.center_lng};
    dirs.push({start: start, target: target});

    this.directions = (JSON.stringify(this.directions) === JSON.stringify(dirs)) ? this.directions : dirs;
  }

  constructor(private geoLocationService: GeoLocationService, private mapsAPILoader: MapsAPILoader,
    private httpClient: HttpClient) { }


  ngOnInit() {
    this.geoLocationService.getPosition()
    .pipe(take(1))
    .subscribe(
        (pos: Position) => {
            this.coordinates = {
              latitude:  +(pos.coords.latitude),
              longitude: +(pos.coords.longitude)
            };

        });

        // Activate for updates
        const intv = interval(2000);

        intv
        .pipe(startWith(0))
        .pipe(takeUntil(this._unsubscribe))
        .subscribe(() => {
          this.getTrashcanInfos();
        });

    }

    ngOnDestroy(): void {
     this._unsubscribe.next();
     this._unsubscribe.complete();
    }
  }
