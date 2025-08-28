import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    // Mock response - in real app this would update the database
    console.log(`Mock: Updating submission ${id} status to ${status}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Status updated successfully (mock)" 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}
