import "./Tooltip.css";

import { Tooltip as TooltipMui, TooltipProps } from "@mui/material";

export const Tooltip: React.FC<TooltipProps> = (props) =>
{
    return (
        <TooltipMui {...props} arrow enterTouchDelay={300} leaveTouchDelay={3000}
            TransitionProps={props.TransitionProps ?? { timeout: 150 }}
            PopperProps={{
                popperOptions: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 12]
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
            }} classes={{ popper: "tooltip" }} />
    );
};