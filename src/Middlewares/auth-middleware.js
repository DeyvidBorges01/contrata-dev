export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user) return next();

  if (req.accepts("html")) return res.redirect("/auth");
  return res.status(401).json({ message: "Acesso não autorizado. Faça login." });
};

export const isDeveloper = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user)
    return res.status(401).json({ message: "Necessário login." });

  if (req.user.role === "developer") return next();

  return res.status(403).json({
    message: "Apenas desenvolvedores podem realizar esta ação.",
  });
};

export const isDeveloperOrAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user)
    return res.status(401).json({ message: "Necessário login." });

  const role = req.user.role;
  if (role === "developer" || role === "admin") return next();

  return res.status(403).json({
    message: "Apenas desenvolvedores ou administradores podem realizar esta ação.",
  });
};

export const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user)
    return res.status(401).json({ message: "Necessário login." });

  if (req.user.role === "admin") return next();

  return res.status(403).json({
    message: "Apenas administradores podem realizar esta ação.",
  });
};

export const isOwnerOrAdmin = (Model) => async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user)
    return res.status(401).json({ message: "Necessário login." });

  if (req.user.role === "admin") return next();

  try {
    const resourceId =
      req.params.id ?? req.params.developerId ?? req.params.projectId;

    if (!resourceId)
      return res.status(400).json({ message: "ID do recurso ausente." });

    const resource = await Model.findByPk(resourceId);
    if (!resource)
      return res.status(404).json({ message: "Recurso não encontrado." });

    const ownerId =
      resource.developerId ?? resource.userId ?? resource.clientId;

    if (ownerId && ownerId === req.user.id) return next();

    return res
      .status(403)
      .json({ message: "Você não é o proprietário deste recurso." });
  } catch (error) {
    console.error("Erro na verificação de propriedade:", error);
    return res.status(500).json({ message: "Erro interno na autorização." });
  }
};
