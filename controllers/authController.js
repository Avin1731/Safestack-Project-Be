exports.googleLogin = async (req, res) => {
  try {
    // Simulasi sukses dulu untuk Fase 1
    res.status(200).json({ 
      message: "Logic Login Google akan dipasang disini",
      token: "dummy-token-jwt" 
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};