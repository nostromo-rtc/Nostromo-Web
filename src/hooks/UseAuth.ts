/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useEffect, useState } from 'react';
import { Buffer } from "buffer";

type RequestState = "false" | "loading" | "not-found" | "true";

export function useAuth(path: string, password?: string | null): RequestState
{
    const [authorized, setAuthorized] = useState<RequestState>("loading");

    useEffect(() =>
    {
        if (!path)
        {
            return;
        }

        const fetchRequest = async (): Promise<void> =>
        {
            setAuthorized("loading");

            const fullPath = `${process.env.REACT_APP_BACKEND_PATH ?? ""}${path}`;
            let res: Response | null = null;

            if (password != null)
            {
                const passwordBase64 = Buffer.from(password, "utf-8").toString("base64");
                res = await fetch(fullPath, {
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "Authorization": passwordBase64
                    }
                });
            }
            else
            {
                res = await fetch(fullPath);
            }

            const HTTP_OK = 200;
            const HTTP_NOT_FOUND = 404;

            if (res.status === HTTP_OK)
            {
                setAuthorized("true");
            }
            else if (res.status === HTTP_NOT_FOUND)
            {
                setAuthorized("not-found");
            }
            else
            {
                setAuthorized("false");
            }
        };

        void fetchRequest();

    }, [path, password]);

    return authorized;
}
