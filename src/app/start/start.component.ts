import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { listen, send } from '../../shared/messenger';
import { QueryWallpaper, QueryWallpaperResolved } from '../../shared/wallpaper';
import { useBrowserOnly } from '../common/platform-browser';
import { ChipSelectComponent } from '../shared/chip-select/chip-select.component';
import { IconComponent } from '../shared/icon/icon.component';
import { provideIcons } from '../shared/icon/icons';
import { IconButtonComponent } from '../shared/icon-button/icon-button.component';
import { iGitHub, iGoogle, iMicrosoft, iYouTube } from '../shared/icons';
import {
  SearchComponent,
  SearchTrailingSlot,
} from '../shared/search/search.component';
import { SearchControlComponent } from '../shared/search-control/search-control.component';
import { SwitchComponent } from '../shared/switch/switch.component';

interface SearchEngine {
  name: string;
  scheme: string;
  icon: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  {
    name: 'Google',
    scheme: 'https://www.google.com/search?query=@',
    icon: 'iGoogle',
  },
  {
    name: 'Bing',
    scheme: 'https://bing.com/search?q=@',
    icon: 'iMicrosoft',
  },
  {
    name: 'YouTube',
    scheme: 'https://www.youtube.com/results?search_query=@',
    icon: 'iYouTube',
  },
  {
    name: 'GitHub',
    scheme: 'https://github.com/search?q=@',
    icon: 'iGitHub',
  },
];

@Component({
  selector: 'adx-start',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconButtonComponent,
    [SearchComponent, SearchTrailingSlot, SearchControlComponent],
    IconComponent,
    ChipSelectComponent,
    SwitchComponent,
  ],
  providers: [provideIcons({ iGoogle, iMicrosoft, iGitHub, iYouTube })],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  host: { '[style.background-image]': 'backgroundImage()' },
})
export class StartComponent {
  private browserOnly = useBrowserOnly();
  private formBuilder = inject(FormBuilder).nonNullable;

  wallpaper = this.browserOnly(() => {
    send(QueryWallpaper);
    return toSignal(listen(QueryWallpaperResolved));
  });

  backgroundImage = computed(() => {
    const url = this.wallpaper && this.wallpaper()?.url;
    return `url(${url})`;
  });

  searchEngineOptions = SEARCH_ENGINES.map((e) => ({
    label: e.name,
    value: e,
    icon: e.icon,
  }));

  form = this.formBuilder.group({
    keywords: '',
    engine: this.searchEngineOptions[0].value,
  });

  onSubmit(): void {}
}
