import { createFileRoute } from "@tanstack/react-router";
import { LastHarvest } from "@/game/LastHarvest";

export const Route = createFileRoute("/")({ component: LastHarvest });
