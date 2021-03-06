import Correction = require('./models/Correction');
import DocumentClass = require('./models/Document');
import HttpClient = require('./providers/helpers/http/HttpClient');
import LoggerClass = require('./utils/Logger');
import text = require('./providers/helpers/text');
import ProviderClass = require('./providers/Provider');
import SpellCheckerClass = require('./SpellChecker');

declare namespace Spech {
  type Document = DocumentClass;
  type Logger = LoggerClass;
  type Provider = ProviderClass;
  type SpellChecker = SpellCheckerClass;

  interface HttpOptions {
    timeout?: number;
  }

  interface InLinePosition {
    number: number;
    position: number;
  }

  interface FragmentPosition {
    startLine: InLinePosition;
    endLine: InLinePosition;
  }

  interface PrintItemObject {
    color?: string;
    indent?: number;
    newLine?: boolean;
    text?: string;
  }

  export type PrintItem = (PrintItemObject & PrintItemObject[]) | string | null;

  interface ProviderHelpers {
    new (helpers: ProviderHelpers, options: object): Provider;
    createHttpClient(httpOptions?: HttpOptions): HttpClient;
    logger: Logger;
    text: typeof text;
  }

  type ProviderResult = Promise<Array<Partial<Correction>>>;

  interface Reporter {
    print(documents: Document[]): PrintItem;
  }

  interface ReporterOptions {
    colors: boolean;
    name: string;
    numberOfLines: string;
    providerOrder: string[];
    showDuplicates?: boolean;
    showProvider?: boolean;
    showRule?: boolean;
  }

  interface TextFragment {
    offset: number;
    text: string;
  }
}

export = Spech;
