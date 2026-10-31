import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

describe('Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should collapse and expand the sidebar accessibly', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const layout = element.querySelector('.layout');
    const toggle = element.querySelector<HTMLButtonElement>('.sidebar-toggle');

    expect(layout).not.toBeNull();
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');

    toggle?.click();
    fixture.detectChanges();

    expect(layout?.classList.contains('colapsado')).toBe(true);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.sidebar nav a')?.getAttribute('aria-label')).toBe('Usuarios');

    toggle?.click();
    fixture.detectChanges();

    expect(layout?.classList.contains('colapsado')).toBe(false);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
  });
});
