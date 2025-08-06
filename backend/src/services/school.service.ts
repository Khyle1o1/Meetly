import { AppDataSource } from "../config/database.config";
import { School } from "../database/entities/school.entity";
import { CreateSchoolDto, UpdateSchoolDto } from "../database/dto/school.dto";
import { NotFoundException } from "../utils/app-error";

export const getAllSchoolsService = async () => {
  const schoolRepository = AppDataSource.getRepository(School);

  const schools = await schoolRepository.find({
    where: { isActive: true },
    order: { name: "ASC" },
  });

  return schools || [];
};

export const createSchoolService = async (createSchoolDto: CreateSchoolDto) => {
  const schoolRepository = AppDataSource.getRepository(School);

  const school = schoolRepository.create(createSchoolDto);
  await schoolRepository.save(school);

  return school;
};

export const updateSchoolService = async (
  schoolId: string,
  updateSchoolDto: UpdateSchoolDto
) => {
  const schoolRepository = AppDataSource.getRepository(School);

  const school = await schoolRepository.findOne({
    where: { id: schoolId },
  });

  if (!school) throw new NotFoundException("School not found");

  Object.assign(school, updateSchoolDto);
  await schoolRepository.save(school);

  return school;
};

export const deleteSchoolService = async (schoolId: string) => {
  const schoolRepository = AppDataSource.getRepository(School);

  const school = await schoolRepository.findOne({
    where: { id: schoolId },
  });

  if (!school) throw new NotFoundException("School not found");

  await schoolRepository.remove(school);

  return { message: "School deleted successfully" };
}; 