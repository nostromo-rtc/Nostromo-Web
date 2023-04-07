import "./Tooltip.css";

import { Tooltip as TooltipMui, TooltipProps } from "@mui/material";

interface ModTooltipProps extends TooltipProps
{
    offset?: number;
}

export const Tooltip: React.FC<ModTooltipProps> = (props) =>
{
    return (
        <TooltipMui {...props} arrow enterTouchDelay={400} enterDelay={200}
            TransitionProps={props.TransitionProps ?? { timeout: 150 }}
            PopperProps={{
                popperOptions: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, props.offset ?? 12]
                            },
                        },
                        {
                            name: "flip",
                            options: {
                                fallbackPlacements: ["bottom", "top", "left", "right"],
                                padding: 0,
                            }
                        }
                    ],
                },
            }} classes={{ tooltip: "tooltip", arrow: "tooltip-arrow" }} />
    );
};