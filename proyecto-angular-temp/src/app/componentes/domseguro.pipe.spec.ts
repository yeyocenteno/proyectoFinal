import { DomseguroPipe } from './domseguro.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('DomseguroPipe', () => {
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    const pipe = new DomseguroPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
