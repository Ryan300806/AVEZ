export interface AllocationResult {
    ticker: string;
    companyName: string;
    allocationAmount: number;
    dividendYield: number;
}

export interface AllocationResponse {
    allocations: AllocationResult[];
    disclaimer: string;
}