import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { ok } from "../utils/responses.js";
import { getUser, updateUser, changePassword, deleteUser } from "../services/userService.js";
import type { User } from "../types/models.js";

const router = Router();

router.use(authRequired);

// Get current user profile
router.get("/me", async (req, res, next) => {
    try {
        const user = req.user as User;
        const profile = await getUser(user.id);
        return ok(res, { user: profile });
    } catch (error) {
        next(error);
    }
});

// Update user profile
const updateSchema = z.object({
    companyName: z.string().optional(),
    siret: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email().optional()
});

router.put("/me", async (req, res, next) => {
    try {
        const user = req.user as User;
        const payload = updateSchema.parse(req.body);
        const updated = await updateUser(user.id, payload);
        return ok(res, { user: updated });
    } catch (error) {
        next(error);
    }
});

// Change password
const passwordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
});

router.post("/me/password", async (req, res, next) => {
    try {
        const user = req.user as User;
        const payload = passwordSchema.parse(req.body);
        await changePassword(user.id, payload.currentPassword, payload.newPassword);
        return ok(res, { message: "Mot de passe mis à jour" });
    } catch (error) {
        next(error);
    }
});

// Delete account
router.delete("/me", async (req, res, next) => {
    try {
        const user = req.user as User;
        await deleteUser(user.id);
        return ok(res, { message: "Compte supprimé" });
    } catch (error) {
        next(error);
    }
});

export default router;
