import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceNewlines'
})
export class ReplaceNewlinesPipe implements PipeTransform {
  transform(value: string, replaceWith: string = ' '): string {
    return value ? value.replace(/\n/g, replaceWith) : '';
  }
}
