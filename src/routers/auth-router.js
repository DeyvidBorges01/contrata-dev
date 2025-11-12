import { Router } from "express";
import passport from "passport";

import { createDeveloper } from "../controllers/developer-controller.js";
import { createContractor } from "../controllers/contractor-controller.js";

import DeveloperModel from "../models/developer-model.js";
import ContractorModel from "../models/contractor-model.js";

const router = Router();

// Página de login/cadastro
router.get("/", (_, res) => {
  res.render("auth");
});

// LOGIN via AJAX
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return res.status(500).json({ message: "Erro no servidor." });
    if (!user)
      return res.status(400).json({ message: info?.message || "Credenciais inválidas." });

    // Cria a sessão de login
    req.login(user, async (err) => {
      if (err)
        return res.status(500).json({ message: "Falha ao criar sessão." });

          try {
        // 🔍 Verifica se é developer ou contractor
        const dev = await DeveloperModel.findOne({ where: { userId: user.id } });
        const contractor = await ContractorModel.findOne({ where: { userId: user.id } });

        let role = "user";
        if (dev) role = "developer";
        if (contractor) role = "contractor";

        // ✅ Responde pro frontend
        return res.status(200).json({
          message: "Login realizado com sucesso.",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role,
          },
        });
      } catch (e) {
        console.error("Erro ao identificar tipo de usuário:", e);
        return res.status(500).json({ message: "Erro ao verificar tipo de usuário." });
      }
    });
  })(req, res, next);
});

// CADASTRO DE DESENVOLVEDOR
router.post("/register/dev", createDeveloper);

// CADASTRO DE CONTRATANTE
router.post("/register/contractor", createContractor);

export default router;