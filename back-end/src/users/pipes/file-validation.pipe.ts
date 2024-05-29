import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File, metadata: ArgumentMetadata): Promise<Express.Multer.File> {

    // Validar mimetype do arquivo pelo magic number
    if (this.isImage(value.buffer) == false) { 
      throw new BadRequestException('O arquivo deve ser um PNG, JPG ou WebP.');
    }

    // Validar tamanho do arquivo
    if (value.size > 3 * 1024 * 1024) {
      throw new BadRequestException('O tamanho do arquivo não pode exceder 2 MB.');
    }

    return value;
  }

  // Verificar se os primeiros bytes correspondem a um arquivo PNG, JPG ou WebP
  private isImage(buffer: Buffer): boolean {
    // Verificar se os primeiros bytes correspondem a um arquivo PNG
    if (
        buffer.length > 8 &&
        buffer[0] === 0x89 && // PNG signature: 89 50 4E 47 0D 0A 1A 0A
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0D &&
        buffer[5] === 0x0A &&
        buffer[6] === 0x1A &&
        buffer[7] === 0x0A
    ) {
        return true
    }

    // Verificar se os primeiros bytes correspondem a um arquivo JPEG
    else if (
        buffer.length > 3 &&
        buffer[0] === 0xFF && 
        buffer[1] === 0xD8 && 
        buffer[2] === 0xFF &&
        (buffer[3] === 0xE0 || buffer[3] === 0xE1)
    ) {
        return true
    }

    // Verificar se os primeiros bytes correspondem a um arquivo WebP
    else if (
        buffer.length > 11 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
        return true
    }

    else {
        return false
    }
  }
}
