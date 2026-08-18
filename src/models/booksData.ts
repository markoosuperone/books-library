export interface GoogleBooksResponse {
    kind: string;
    totalItems?: number;
    items: GoogleBookVolume[];
  }
  
  export interface GoogleBookVolume {
    id: string;
    volumeInfo: VolumeInfo;
  }
  
  export interface VolumeInfo {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: IndustryIdentifier[];
    readingModes?: ReadingModes;
    pageCount?: number;
    printType?: string;
    categories?: string[];
    maturityRating?: string;
    allowAnonLogging?: boolean;
    contentVersion?: string;
    panelizationSummary?: PanelizationSummary;
    imageLinks?: ImageLinks;
    language?: string;
    previewLink?: string;
    infoLink?: string;
    canonicalVolumeLink?: string;
  }
  
  export interface IndustryIdentifier {
    type: string;
    identifier: string;
  }
  
  export interface ReadingModes {
    text: boolean;
    image: boolean;
  }
  
  export interface PanelizationSummary {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  }
  
  export interface ImageLinks {
    smallThumbnail?: string;
    thumbnail?: string;
  }
  
  export interface SaleInfo {
    country: string;
    saleability: string;
    isEbook: boolean;
  }
  
  export interface AccessInfo {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub?: { isAvailable: boolean };
    pdf?: { isAvailable: boolean };
    webReaderLink?: string;
    accessViewStatus?: string;
    quoteSharingAllowed?: boolean;
  }
  
  export interface SearchInfo {
    textSnippet: string;
  }