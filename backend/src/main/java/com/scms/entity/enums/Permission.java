@Column(
        name = "permission_name",
        nullable = false,
        unique = true,
        length = 100
)
private String name;