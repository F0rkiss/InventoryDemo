import { Quill } from 'react-quill';
import BlotFormatter from 'quill-blot-formatter';
import ImageUploader from 'quill-image-uploader';

// 1. Setup Custom Blot (Copy dari kodingan lo yang sebelumnya)
const BaseImage = Quill.import('formats/image');
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style' 
];

class ImageBlot extends BaseImage {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

// 2. Register Module (Hanya dilakukan sekali disini)
// Kita cek dulu biar warningnya bener-bener ilang kalau file ini keload 2x
if (!Quill.imports['modules/blotFormatter']) {
    Quill.register('modules/blotFormatter', BlotFormatter);
}
if (!Quill.imports['modules/imageUploader']) {
    Quill.register('modules/imageUploader', ImageUploader);
}

// Register Custom Image Blot
// Note: Quill.register akan overwrite kalau nama sama, tapi karena logicnya sama, aman.
Quill.register(ImageBlot, true);

export default Quill;