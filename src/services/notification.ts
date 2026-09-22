import type { AllocationResponse } from "../types/allocation.js";

export async function sendNotification(
    result: AllocationResponse
): Promise<void> {
    console.log("Notification payload siap dikirim:");

    console.dir(result, { depth: null });
}