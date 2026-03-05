import { NextRequest } from "next/server";

import UserPermissionModel from "@base/server/models/UserPermission/UserPermissionModel";
import { getProgress } from "@base/server/import/importProgressStore";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return new Response(JSON.stringify({ error: "jobId is required" }), {
      status: 400,
    });
  }

  const state = getProgress(jobId);

  if (!state) {
    return new Response(JSON.stringify({ error: "Job not found" }), {
      status: 404,
    });
  }

  const requiredPermission = state.requiredPermission;

  if (requiredPermission) {
    const permissionModel = new UserPermissionModel();
    const hasPermission = await permissionModel.hasAllPermissions(userId, [
      requiredPermission,
    ]);

    if (!hasPermission) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const current = getProgress(jobId);

        if (!current) {
          clearInterval(interval);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ status: "error", error: "Job not found" })}\n\n`,
            ),
          );
          controller.close();

          return;
        }

        const payload = {
          status: current.status,
          processed: current.processed,
          total: current.total,
          errors: current.errors,
          result: current.result,
          errorMessage: current.errorMessage,
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );

        if (current.status === "done" || current.status === "error") {
          clearInterval(interval);
          controller.close();
        }
      }, 500);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
