              {/* Stats Bar */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-px max-w-3xl mx-auto rounded-2xl border border-white/[0.06]
                           bg-white/[0.02] backdrop-blur-sm overflow-hidden animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                {[
                  { value: "50K+", label: "Active Users", icon: Users },
                  { value: "120K+", label: "Listings", icon: ShoppingBag },
                  { value: "99.9%", label: "Uptime", icon: Zap },
                  { value: "4.9★", label: "Rating", icon: Star },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center group py-4 sm:py-5 px-2 hover:bg-white/[0.03] transition-colors duration-300"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <stat.icon className="w-4 h-4 text-neon-purple opacity-70" />
                      <span className="font-display text-xl sm:text-3xl font-bold text-foreground">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>