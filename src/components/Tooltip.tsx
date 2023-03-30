import "./Tooltip.css";

import { Tooltip as TooltipMui, TooltipProps } from "@mui/material";

export const Tooltip: React.FC<TooltipProps> = (props) =>
{
    return (
        <TooltipMui {...props} arrow
            TransitionProps={props.TransitionProps ?? { timeout: 150 }}
            PopperProps={{
                popperOptions: {
                    modifiers: [{
                        name: 'offset',
                        options: { offset: [0, 0] }
                    }],
                },
            }} classes={{ popper: "tooltip" }} />
    );
};