import { EncodedImage } from "../image_encoder";
import { LabelType } from "../packets";
import { Abstraction } from "../packets/abstraction";

export type PrintOptions = {
  /** Printer label type */
  labelType: LabelType;

  /** Print density */
  density: number;

  /** How many pages will be printed */
  totalPages: number;

  /** Used in {@link waitForFinished} where status is received by polling */
  statusPollIntervalMs: number;

  /** Used in {@link waitForFinished} */
  statusTimeoutMs: number;

  /** Used in {@link printPage} */
  pageTimeoutMs: number;
};

const printOptionsDefaults: PrintOptions = {
  labelType: LabelType.WithGaps,
  density: 2,
  totalPages: 1,
  statusPollIntervalMs: 300,
  statusTimeoutMs: 5_000,
  pageTimeoutMs: 10_000,
};

export abstract class AbstractPrintTask {
  protected abstraction: Abstraction;
  protected printOptions: PrintOptions;
  protected pagesPrinted: number;

  constructor(abstraction: Abstraction, printOptions?: Partial<PrintOptions>) {
    this.abstraction = abstraction;
    this.pagesPrinted = 0;

    this.printOptions = {
      ...printOptionsDefaults,
      ...printOptions,
    };
  }

  protected checkAddPage(quantity: number) {
    if (this.pagesPrinted + quantity > (this.printOptions.totalPages ?? 1)) {
      throw new Error("Trying to print too many pages (task totalPages may not be set correctly)");
    }
  }

  /** Prepare print (set label type, density, print start, ...) */
  abstract printInit(): Promise<void>;
  /** Print image with a specified number of copies */
  abstract printPage(image: EncodedImage, quantity?: number): Promise<void>;
  /** Wait for print is finished */
  abstract waitForFinished(): Promise<void>;
  /** Printer's printhead resolution in pixels */
  protected printheadPixels(): number | undefined {
    return this.abstraction.getClient().getModelMetadata()?.printheadPixels;
  }
}
