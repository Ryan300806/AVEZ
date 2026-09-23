export interface SectorsCompanyFinancial {
    year: number;
    symbol: string;
    net_income: number;
    company_name: string;
    total_assets: number;
    total_equity: number;
    total_liabilities: number;
}

export interface SectorsPeerData {
    companies: SectorsCompanyFinancial[];
}

export interface SectorsPeer {
    peers_data: SectorsPeerData;
}

export interface SectorsDividend {
    yield_ttm: number;
    payout_ratio: number;
}

export interface SectorsCompanyReport {
    symbol: string;
    company_name: string;

    dividend: SectorsDividend;

    peers: SectorsPeer[];

    [key: string]: unknown;
}