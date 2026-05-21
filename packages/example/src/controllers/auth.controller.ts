import { Body, Controller, Post } from "@inversifyjs/http-core";
import { AuthService } from "../services/auth.service.js";
import { inject } from "inversify";

@Controller('/api/auth')
export class AuthController {
    constructor(@inject(AuthService) private readonly authService: AuthService) {}

    @Post('/login')
    login(@Body() request: { name: string}) {
        return this.authService.login(request.name);
    }
}