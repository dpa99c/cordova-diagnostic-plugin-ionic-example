import { Component } from '@angular/core';

import { SettingsPage } from '../settings/settings';
import { StatePage } from '../state/state';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = StatePage;
  tab2Root = SettingsPage;

  constructor() {

  }
}
