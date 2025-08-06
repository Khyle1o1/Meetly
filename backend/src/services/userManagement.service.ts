import { AppDataSource } from "../config/database.config";
import { User, UserRole } from "../database/entities/user.entity";
import { NotFoundException, BadRequestException } from "../utils/app-error";

export const getAllUsersService = async (search?: string, page: number = 1, limit: number = 10) => {
  const userRepository = AppDataSource.getRepository(User);
  
  const queryBuilder = userRepository.createQueryBuilder("user");
  
  if (search) {
    queryBuilder.where(
      "user.name ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search",
      { search: `%${search}%` }
    );
  }
  
  const [users, total] = await queryBuilder
    .select(["user.id", "user.name", "user.email", "user.username", "user.role", "user.createdAt"])
    .orderBy("user.createdAt", "DESC")
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();
  
  return {
    users: users.map(user => user.omitPassword()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getUserByIdService = async (userId: string) => {
  const userRepository = AppDataSource.getRepository(User);
  
  const user = await userRepository.findOne({
    where: { id: userId },
    select: ["id", "name", "email", "username", "role", "createdAt", "updatedAt"]
  });
  
  if (!user) {
    throw new NotFoundException("User not found");
  }
  
  return user;
};

export const updateUserRoleService = async (userId: string, newRole: UserRole, adminUserId: string) => {
  const userRepository = AppDataSource.getRepository(User);
  
  // Verify the admin user exists and is actually an admin
  const adminUser = await userRepository.findOne({
    where: { id: adminUserId, role: UserRole.ADMIN }
  });
  
  if (!adminUser) {
    throw new BadRequestException("Only admins can update user roles");
  }
  
  // Prevent admin from changing their own role
  if (userId === adminUserId) {
    throw new BadRequestException("Cannot change your own role");
  }
  
  const user = await userRepository.findOne({
    where: { id: userId }
  });
  
  if (!user) {
    throw new NotFoundException("User not found");
  }
  
  // Update the user's role
  user.role = newRole;
  await userRepository.save(user);
  
  return user.omitPassword();
};

export const searchUsersService = async (searchTerm: string, page: number = 1, limit: number = 10) => {
  const userRepository = AppDataSource.getRepository(User);
  
  const queryBuilder = userRepository.createQueryBuilder("user");
  
  queryBuilder.where(
    "user.name ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search",
    { search: `%${searchTerm}%` }
  );
  
  const [users, total] = await queryBuilder
    .select(["user.id", "user.name", "user.email", "user.username", "user.role", "user.createdAt"])
    .orderBy("user.createdAt", "DESC")
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();
  
  return {
    users: users.map(user => user.omitPassword()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}; 